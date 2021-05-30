import create from "zustand";

export const useResourceDrawer = create<{
  visible: boolean;
  unseenCount: number;
  toggle: () => void;
}>((set) => ({
  visible: false,
  unseenCount: 0,
  toggle: () =>
    set((state) => ({
      ...state,
      unseenCount: 0, // always 0 when toggling on or off
      visible: !state.visible,
    })),
}));
