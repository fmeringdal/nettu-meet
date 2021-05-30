import { createMuiTheme } from "@material-ui/core";

export const lightTheme = createMuiTheme({
  palette: {
    type: "light",
    background: {
      paper: "#fff",
      default: "#f2f4f6",
    },
    text: {
      primary: "#263238",
      secondary: "#546e7a",
    },
  },
});
