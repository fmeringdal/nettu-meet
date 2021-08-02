import { EventEmitter } from "events";
import { fabric } from "fabric";
import { Canvas, IEvent, Object as FabricObject } from "fabric/fabric-impl";
import { CanvasStateManager } from "./CanvasStateManager";
import { logger } from "../../../logger";

export const CANVAS_ELEMENT_ID = "conference_canvas";

export enum CANVAS_MODE {
  PICKER = "PICKER",
  FREEDRAW = "FREEDRAW",
  CIRCLE = "CIRCLE",
  RECT = "RECT",
  ERASER = "ERASER",
  TEXT = "TEXT",
  LINE = "LINE",
}

export type CanvasToolbar = {
  mode: string;
  color: string;
  brushWidth: number;
  selectedObject?: FabricObject;
};

const ID = () => {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 12 characters
  // after the decimal.
  return "object_" + Math.random().toString(36).substr(2, 12);
};

export const CANVAS_TOPICS = {
  TOOLBAR_CHANGED: "TOOLBAR_CHANGED",
  OBJECT_REMOVED: "OBJECT_REMOVED",
  OBJECT_ADDED: "OBJECT_ADDED",
  OBJECT_MODIFIED: "OBJECT_MODIFIED",
  CANVAS_CLEARED: "CANVAS_CLEARED",
  CANVAS_UNDO: "CANVAS_UNDO",
  CANVAS_REDO: "CANVAS_REDO",
};

export class CanvasManager extends EventEmitter {
  private canvas: Canvas | undefined;
  private canvasStataManger: CanvasStateManager | undefined;
  public isInitialized: boolean;

  private toolbar: CanvasToolbar;

  private mouse: {
    isDown: boolean;
    object?: FabricObject;
    mouseDownCords?: {
      x: number;
      y: number;
    };
  };

  constructor() {
    super();
    this.toolbar = {
      mode: CANVAS_MODE.FREEDRAW,
      color: "#000",
      brushWidth: 7,
    };
    this.mouse = {
      isDown: false,
    };
    this.isInitialized = false;
    this.setupInternalListeners();
  }

  get canvasToolbar(): CanvasToolbar {
    return Object.freeze({ ...this.toolbar });
  }

  private setupInternalListeners = () => {
    this.on(CANVAS_TOPICS.TOOLBAR_CHANGED, () => this.onToolbarChanged());

    // Listen for all state changes
    this.on(CANVAS_TOPICS.OBJECT_MODIFIED, () => this.onStateChange());
    this.on(CANVAS_TOPICS.OBJECT_ADDED, () => this.onStateChange());
    this.on(CANVAS_TOPICS.OBJECT_REMOVED, () => this.onStateChange());

    let width = window.innerWidth;
    let height = window.innerHeight;
    setInterval(() => {
      if (width !== window.innerWidth || height !== window.innerHeight) {
        width = window.innerWidth;
        height = window.innerHeight;
        const canvas = this.canvas;
        if (canvas) {
          canvas.setWidth(window.innerWidth - 400);
          canvas.setHeight(window.innerHeight - 96);
          canvas.calcOffset();
          canvas.renderAll();
        }
      }
    }, 2000);
  };

  private onStateChange = () => {
    this.canvasStataManger!.saveState();
  };

  public redo = () => {
    this.canvasStataManger!.redo();
    this.emit(CANVAS_TOPICS.CANVAS_REDO);
  };

  public undo = () => {
    this.canvasStataManger!.undo();
    this.emit(CANVAS_TOPICS.CANVAS_UNDO);
  };

  public clear = (notify: boolean = true) => {
    this.getCanvas().clear();
    this.onStateChange();
    if (notify) {
      this.emit(CANVAS_TOPICS.CANVAS_CLEARED);
    }
  };

  public setSelectedObjectZPos(pos: 0 | 1 | 2 | 3) {
    if (this.toolbar.selectedObject == null) {
      return;
    }
    switch (pos) {
      case 0:
        this.toolbar.selectedObject.sendToBack();
        break;
      case 1:
        this.toolbar.selectedObject.sendBackwards();
        break;
      case 2:
        this.toolbar.selectedObject.bringForward();
        break;
      case 3:
        this.toolbar.selectedObject.bringToFront();
        break;
    }
  }

  setMode(mode: string) {
    this.toolbar.mode = mode;
    const canvas = this.getCanvas();

    canvas.isDrawingMode = mode === CANVAS_MODE.FREEDRAW;
    const inPickerMode = mode === CANVAS_MODE.PICKER;
    const inEraserMode = mode === CANVAS_MODE.ERASER;
    if (inEraserMode) {
      canvas.hoverCursor = "not-allowed";
    } else if (inPickerMode) {
      canvas.hoverCursor = "pointer";
    } else if (canvas.isDrawingMode) {
      canvas.hoverCursor = "crosshair";
    } else {
      canvas.hoverCursor = "default";
    }
    if (this.toolbar.selectedObject) {
      this.toolbar.selectedObject = undefined;
    }
    this.emit(CANVAS_TOPICS.TOOLBAR_CHANGED, this.canvasToolbar);
  }

  setColor = (color: string) => {
    const canvas = this.getCanvas();
    canvas.freeDrawingBrush.color = color;
    this.toolbar.color = color;
    if (this.toolbar.selectedObject) {
      this.toolbar.selectedObject.set({
        fill:
          this.toolbar.selectedObject.type === "line" ? color : "transparent",
        stroke: color,
      });
      this.onObjectModified(this.toolbar.selectedObject);
    }
    this.emit(CANVAS_TOPICS.TOOLBAR_CHANGED, this.canvasToolbar);
  };

  setBrushWidth = (width: number) => {
    const canvas = this.getCanvas();
    canvas.freeDrawingBrush.width = width;
    this.toolbar.brushWidth = width;
    if (this.toolbar.selectedObject) {
      this.toolbar.selectedObject.set({
        strokeWidth: width,
      });
      this.onObjectModified(this.toolbar.selectedObject);
    }
    this.emit(CANVAS_TOPICS.TOOLBAR_CHANGED, this.canvasToolbar);
  };

  private onToolbarChanged = () => {
    const canvas = this.getCanvas();
    const mode = this.toolbar.mode;
    const inPickerMode = mode === CANVAS_MODE.PICKER;
    const inEraserMode = mode === CANVAS_MODE.ERASER;
    const makeObjectsSelectable = inPickerMode || inEraserMode;
    // canvas.discardActiveObject();
    const objects = canvas.getObjects();
    for (let i = 0; i < objects.length; i++) {
      objects[i].set({
        selectable: makeObjectsSelectable,
        evented: makeObjectsSelectable,
      });
      if (makeObjectsSelectable) {
        objects[i].setCoords();
      }
    }
    canvas.renderAll();
  };

  insertImage = (url: string, id: string) => {
    fabric.Image.fromURL(url, async (o) => {
      (o as any).id = id;
      o.set("top", 100);
      o.set("left", 200);
      o.set("backgroundColor", "#fff");
      o.scale(0.7);

      this.setMode(CANVAS_MODE.PICKER);
      this.addObject(o, true);
    });
  };

  initializeCanvas(canvasJSON: any) {
    this.canvas = new fabric.Canvas(CANVAS_ELEMENT_ID);
    (window as any).canvas = this.canvas;
    this.canvas.freeDrawingBrush.color = this.toolbar.color;
    this.canvas.freeDrawingBrush.width = this.toolbar.brushWidth;

    this.canvas.isDrawingMode = false;
    this.canvas.selection = false;
    this.canvas.loadFromJSON(canvasJSON, () => null);
    this.setupLocalListeners();

    this.canvasStataManger = new CanvasStateManager(this.canvas);
    this.isInitialized = true;
    this.setMode(this.canvasToolbar.mode);
  }

  private getCanvas(): Canvas {
    return this.canvas!;
  }

  setupLocalListeners() {
    const canvas = this.getCanvas();
    canvas.on("mouse:down", (e) => this.onMouseDown(e));
    canvas.on("mouse:move", (e) => this.onMouseMove(e));
    canvas.on("mouse:up", (e) => this.onMouseUp(e));
    canvas.on("mouse:over", (e) => this.onMouseOver(e));
    canvas.on("mouse:out", (e) => this.onMouseOut(e));

    canvas.on("selection:created", (e) => this.onSelectionCreated(e));
    canvas.on("selection:cleared", (e) => this.onSelectionCleared(e));
    canvas.on("selection:updated", (e) => this.onSelectionUpdated(e));

    // canvas.on("history:undo", (e) => log("history:undo"));
    // canvas.on("history:redo", (e) => log("history:redo"));
    canvas.on("object:modified", (e) =>
      e.target ? this.onObjectModified(e.target) : null
    );
    // canvas.on("object:added", (e) => log("object:added"));
    // canvas.on("object:removed", (e) => log("object:removed"));
    canvas.on("path:created", (e) => this.onPathCreated(e));
  }

  getCanvasJSON(): string {
    const canvas = this.getCanvas();
    if (canvas) {
      return JSON.stringify(canvas.toJSON());
    } else {
      return "{}";
    }
  }

  downloadCanvas = () => {
    const canvas = this.getCanvas();
    const dataURL = canvas.toDataURL({
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      left: 0,
      top: 0,
      format: "png",
    });
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  public static isReady(): boolean {
    const canvasIsMounted = document.getElementById(CANVAS_ELEMENT_ID);
    return canvasIsMounted != null;
  }

  private setActiveObject(o: FabricObject) {
    this.getCanvas().setActiveObject(o);
  }

  private setSelectedObject(o: FabricObject | undefined) {
    this.toolbar.selectedObject = o;
    this.emit(CANVAS_TOPICS.TOOLBAR_CHANGED, this.canvasToolbar);
  }

  onMouseDown = (e: IEvent): void => {
    if (this.toolbar.mode === CANVAS_MODE.FREEDRAW) return;
    this.mouse.isDown = true;

    const canvas = this.getCanvas();
    const pointer = canvas.getPointer(e.e);
    this.mouse.mouseDownCords = {
      x: pointer.x,
      y: pointer.y,
    };
    this.mouse.object = e.target;

    if (this.toolbar.mode === CANVAS_MODE.PICKER) {
      if (e.target == null) return;
      this.setActiveObject(e.target);
      return;
    }
    if (this.toolbar.mode === CANVAS_MODE.ERASER && e.target) {
      this.removeObject(e.target);
      return;
    }

    let addedObject: FabricObject;

    if (this.toolbar.mode === CANVAS_MODE.LINE) {
      const points = [pointer.x, pointer.y, pointer.x, pointer.y];
      const line = new fabric.Line(points, {
        strokeWidth: canvas.freeDrawingBrush.width,
        fill: canvas.freeDrawingBrush.color,
        stroke: canvas.freeDrawingBrush.color,
        originX: "center",
        originY: "center",
        // selectable: false
      });
      addedObject = line;
    } else if (this.toolbar.mode === CANVAS_MODE.RECT) {
      const rect = new fabric.Rect({
        width: 0,
        height: 0,
        left: pointer.x,
        top: pointer.y,
        fill: "transparent",
        stroke: canvas.freeDrawingBrush.color,
        strokeWidth: canvas.freeDrawingBrush.width,
        // fill: self.canvas.freeDrawingBrush.color
      });

      addedObject = rect;
    } else if (this.toolbar.mode === CANVAS_MODE.CIRCLE) {
      const circle = new fabric.Circle({
        width: 0,
        height: 0,
        left: pointer.x,
        top: pointer.y,
        fill: "transparent",
        originX: "left",
        originY: "top",
        radius: 0,
        angle: 0,
        stroke: canvas.freeDrawingBrush.color,
        strokeWidth: canvas.freeDrawingBrush.width,
      });
      addedObject = circle;
    } else if (this.toolbar.mode === CANVAS_MODE.TEXT) {
      return;
    } else {
      return;
    }

    (addedObject as any).id = ID();

    this.mouse.object = addedObject;
    this.addObject(addedObject, false);
  };

  private commitObject(obj: FabricObject) {
    logger.info("commiting object");
    this.emit(CANVAS_TOPICS.OBJECT_ADDED, obj);
  }

  private addObject(obj: FabricObject, commit?: boolean) {
    logger.info({commit:commit},"adding object but not commiting? ");
    this.getCanvas().add(obj);
    if (commit) {
      this.commitObject(obj);
    }
  }

  private removeObject(obj: FabricObject, notify: boolean = true) {
    this.getCanvas().remove(obj);
    if (notify) {
      this.emit(CANVAS_TOPICS.OBJECT_REMOVED, obj);
    }
  }

  private onMouseMove = (e: IEvent): void => {
    if (!this.mouse.isDown) {
      return;
    }

    if (this.toolbar.mode === CANVAS_MODE.ERASER) {
      if (e.target) {
        this.getCanvas().remove(e.target);
      }
      return;
    }

    if (this.mouse.object == null) {
      return;
    }

    if (
      [CANVAS_MODE.FREEDRAW, CANVAS_MODE.PICKER].includes(
        this.toolbar.mode as any
      )
    ) {
      return;
    }

    let activeObject = this.mouse.object!;

    const canvas = this.getCanvas();

    const pointer = canvas.getPointer(e.e);

    if (this.toolbar.mode === CANVAS_MODE.LINE) {
      // @ts-ignore
      activeObject.set({ x2: pointer.x, y2: pointer.y });
    } else if (this.toolbar.mode === CANVAS_MODE.LINE) {
      const currentX = activeObject.get("left") || 0;
      const currentY = activeObject.get("top") || 0;
      const width = pointer.x - currentX;
      const height = pointer.y - currentY;

      if (!width || !height) {
        return;
      }

      activeObject.set("width", width).set("height", height);
    } else if (this.toolbar.mode === CANVAS_MODE.CIRCLE) {
      const currentX = activeObject.get("left")!;
      const currentY = activeObject.get("top")!;

      let radius = Math.abs(currentY - pointer.y) / 2;
      if (activeObject.strokeWidth && radius > activeObject.strokeWidth) {
        radius -= activeObject.strokeWidth / 2;
      }

      // @ts-ignore
      activeObject.set({ radius });
      if (currentX > pointer.x) {
        activeObject.set({ originX: "right" });
      } else {
        activeObject.set({ originX: "left" });
      }
      if (currentY > pointer.y) {
        activeObject.set({ originY: "bottom" });
      } else {
        activeObject.set({ originY: "top" });
      }
    } else if (this.toolbar.mode === CANVAS_MODE.RECT) {
      const currentX = activeObject.get("left")!;
      const currentY = activeObject.get("top")!;
      const width = pointer.x - currentX;
      const height = pointer.y - currentY;

      if (!width || !height) {
        return;
      }

      activeObject.set("width", width).set("height", height);
    }

    canvas.renderAll();
  };

  private onMouseUp = (e: IEvent): void => {
    if (!this.mouse.isDown) return;

    if (
      [
        CANVAS_MODE.FREEDRAW,
        CANVAS_MODE.PICKER,
        CANVAS_MODE.TEXT,
        CANVAS_MODE.ERASER,
      ].includes(this.toolbar.mode as any)
    )
      return;

    if (this.mouse.object == null) return;

    this.commitObject(this.mouse.object);

    this.mouse = {
      isDown: false,
    };
  };

  private onMouseOver = (e: IEvent): void => {
    if (!this.mouse.isDown || e.target == null) return;
    if (this.toolbar.mode === CANVAS_MODE.ERASER) {
      this.removeObject(e.target);
    }
  };

  private onMouseOut = (e: IEvent): void => {
    // if (this.mouse.isDown) {
    //   this.mouse = {
    //     isDown: false,
    //   };
    // }
  };

  private onSelectionCreated = (e: IEvent): void => {
    logger.info("onSelectionCreated: " + e);
    if (e.target === this.toolbar.selectedObject) return;
    this.setSelectedObject(e.target);
  };

  private onSelectionCleared = (e: IEvent): void => {
    logger.info("onSelectionCleared: " + e);
    this.setSelectedObject(undefined);
  };

  private onSelectionUpdated = (e: IEvent): void => {
    logger.info("onSelectionUpdated: " + e);
    if (e.target === this.toolbar.selectedObject) return;
    this.setSelectedObject(e.target);
  };

  private onObjectModified = (o: FabricObject): void => {
    this.emit(CANVAS_TOPICS.OBJECT_MODIFIED, o);
  };

  private onPathCreated = (e: IEvent): void => {
    const path = (e as any).path;
    path.id = ID();
    this.emit(CANVAS_TOPICS.OBJECT_ADDED, path);
  };

  private getObjectById = (id: string): FabricObject | undefined => {
    const objects = this.getCanvas().getObjects();
    for (const object of objects) {
      if ((object as any).id === id) {
        return object;
      }
    }
  };

  private setObjectSelectibility = (o: FabricObject) => {
    const selectable = [CANVAS_MODE.ERASER, CANVAS_MODE.PICKER].includes(
      this.toolbar.mode as any
    );
    o.set({
      selectable: selectable,
      evented: selectable,
    });
  };

  // external events from other users
  onExternalObjectCreated = async (oProps: any) => {
    let o: FabricObject;
    logger.info("type of o: " + oProps.type);
    switch (oProps.type) {
      case "path":
        o = new fabric.Path(
          oProps.path.map((el: any) => el.join(" ")).join(" "),
          oProps
        );
        break;
      case "circle":
        o = new fabric.Circle(oProps);
        break;
      case "rect":
        o = new fabric.Rect(oProps);
        break;
      case "line":
        const points = [oProps.x1, oProps.y1, oProps.x2, oProps.y2];
        o = new fabric.Line(points, oProps);
        break;
      case "image":
        o = await new Promise((res) => {
          fabric.Image.fromURL(oProps.src, (o) => {
            o.set({ ...oProps });
            res(o);
          });
        });
        break;
      default:
        return;
    }
    this.setObjectSelectibility(o);

    this.addObject(o, false);
    this.onStateChange();
  };

  onExternalObjectModified = (oProps: any) => {
    let o = this.getObjectById(oProps.id);
    if (!o) return;
    try {
      o.set(oProps);
      o.setCoords();
      this.setObjectSelectibility(o);

      this.getCanvas().renderAll();
      this.onStateChange();
    } catch (error) {
      // never have seen an error here, but maybe ...
    }
  };

  onExternalObjectRemove = (id: string) => {
    let o = this.getObjectById(id);
    if (!o) return;
    this.removeObject(o, false);
  };

  onExternalCanvasClear = () => {
    this.clear(false);
  };

  onExternalCanvasRedo = (canvasJSON: any) => {
    this.getCanvas().loadFromJSON(canvasJSON, () => null);
    this.onStateChange();
  };

  onExternalCanvasUndo = (canvasJSON: any) => {
    this.getCanvas().loadFromJSON(canvasJSON, () => null);
    this.onStateChange();
  };

  // When changing canvas
  // TODO: notify peers
  public clearHistoryAndSetCanvas(canvasJSON: any) {
    this.canvasStataManger = new CanvasStateManager(this.getCanvas());
    this.getCanvas().loadFromJSON(canvasJSON, () => null);
  }
}

export const canvasManager = new CanvasManager();
