import create from "zustand";
import { canvasManager, CanvasToolbar, CANVAS_TOPICS } from "./CanvasManager";

export const useToolbarState = create<CanvasToolbar>((set) => ({
  ...canvasManager.canvasToolbar,
}));

canvasManager.on(CANVAS_TOPICS.TOOLBAR_CHANGED, (toolbar) => {
  updateState(toolbar);
});

export const updateState = (
  newState: CanvasToolbar | ((state: CanvasToolbar) => CanvasToolbar)
) => {
  if (typeof newState === "function") {
    const updatedState = newState(useToolbarState.getState());
    useToolbarState.setState(() => ({ ...updatedState }));
  } else {
    useToolbarState.setState(() => ({ ...newState }));
  }
};
