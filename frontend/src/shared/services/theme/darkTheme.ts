import { createMuiTheme } from "@material-ui/core";

export const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    background: {
      default: "#1c2025",
      paper: "#282C34",
    },
    // secondary: {
    //   main: "#5b43c2",
    // },
  },
});
