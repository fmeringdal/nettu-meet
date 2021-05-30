import create from "zustand";

type LayoutState = {
  videoMode: boolean;
  toggleVideoMode: () => void;
};

export const useLayoutState = create<LayoutState>((set, get) => ({
  videoMode: false,
  toggleVideoMode: () =>
    set({
      videoMode: !get().videoMode,
    }),
}));
