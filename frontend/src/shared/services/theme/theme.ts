import create from "zustand";

type ThemeState = {
  theme: string;
  toggle: () => void;
};

export const useThemeState = create<ThemeState>((set) => ({
  theme: localStorage.getItem("theme") || "light",
  toggle: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      // window.location.reload();
      return {
        ...state,
        theme: newTheme,
      };
    }),
}));
