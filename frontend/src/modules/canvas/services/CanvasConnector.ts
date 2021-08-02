import { Socket } from "socket.io-client";
import { signalingChannel } from "../../../shared/services/theme/signalling";
import { canvasManager, CANVAS_TOPICS } from "./CanvasManager";
import { Object as FabricObject } from "fabric/fabric-impl";
import { meetingState } from "../../meeting/state/meeting";
import { logger } from "../../../logger";

export type CanvasAction =
  | "redo"
  | "undo"
  | "clear"
  | "create"
  | "modified"
  | "remove";

export interface EmitCanvasUpdateEvent {
  canvasJSON: string;
  action: CanvasAction;
  actionData: string;
}

export interface OnCanvasUpdateEvent {
  meetingId: string;
  canvasId: string;
  event: {
    action: CanvasAction;
    actionData: string;
  };
}

export const onCanvasUpdate = (e: EmitCanvasUpdateEvent) => {
  const { meeting } = meetingState.getState();
  if (!meeting || !meeting.activeCanvasId) return;

  signalingChannel.emit("canvas-update", meeting.activeCanvasId, e);
};

canvasManager.on(CANVAS_TOPICS.OBJECT_ADDED, (o: FabricObject) => {
  onCanvasUpdate({
    action: "create",
    actionData: JSON.stringify(o.toJSON(["id"])),
    canvasJSON: canvasManager.getCanvasJSON(),
  });
});

canvasManager.on(CANVAS_TOPICS.OBJECT_REMOVED, (o: FabricObject) => {
  onCanvasUpdate({
    action: "remove",
    actionData: JSON.stringify({
      id: (o as any).id,
    }),
    canvasJSON: canvasManager.getCanvasJSON(),
  });
});

canvasManager.on(CANVAS_TOPICS.OBJECT_MODIFIED, (o: FabricObject) => {
  onCanvasUpdate({
    action: "modified",
    actionData: JSON.stringify(o.toJSON(["id"])),
    canvasJSON: canvasManager.getCanvasJSON(),
  });
});

canvasManager.on(CANVAS_TOPICS.CANVAS_CLEARED, () => {
  onCanvasUpdate({
    action: "clear",
    actionData: JSON.stringify({}),
    canvasJSON: canvasManager.getCanvasJSON(),
  });
});

canvasManager.on(CANVAS_TOPICS.CANVAS_UNDO, () => {
  const canvasJSON = canvasManager.getCanvasJSON();
  onCanvasUpdate({
    action: "undo",
    actionData: canvasJSON,
    canvasJSON,
  });
});

canvasManager.on(CANVAS_TOPICS.CANVAS_REDO, () => {
  const canvasJSON = canvasManager.getCanvasJSON();
  onCanvasUpdate({
    action: "redo",
    actionData: canvasJSON,
    canvasJSON,
  });
});

export const setupSocketListeners = (socket: Socket) => {
  socket.on("canvas-update", (e: OnCanvasUpdateEvent) => {
    if (e.event.action === "create") {
      const oProps = JSON.parse(e.event.actionData);
      canvasManager.onExternalObjectCreated(oProps);
    } else if (e.event.action === "remove") {
      const { id } = JSON.parse(e.event.actionData);
      canvasManager.onExternalObjectRemove(id);
    } else if (e.event.action === "modified") {
      const oProps = JSON.parse(e.event.actionData);
      canvasManager.onExternalObjectModified(oProps);
    } else if (e.event.action === "clear") {
      canvasManager.onExternalCanvasClear();
    } else if (e.event.action === "undo") {
      const canvasJSON = JSON.parse(e.event.actionData);
      canvasManager.onExternalCanvasUndo(canvasJSON);
    } else if (e.event.action === "redo") {
      const canvasJSON = JSON.parse(e.event.actionData);
      canvasManager.onExternalCanvasRedo(canvasJSON);
    }

    // parse event and call canvasManager with action to update canvas
    logger.info({event : e},"received canvas event");
    logger.info("received canvas event done");
  });
};

setupSocketListeners(signalingChannel);
