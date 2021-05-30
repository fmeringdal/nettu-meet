import { Paper, ThemeProvider } from "@material-ui/core";
import React from "react";
import "./App.css";
import { Routes } from "./pages/routes";
import { darkTheme } from "./shared/services/theme/darkTheme";
import { lightTheme } from "./shared/services/theme/lightTheme";
import { useThemeState } from "./shared/services/theme/theme";

// Subscribers to canvasmanager
import "./modules/canvas/services/CanvasConnector";
// import "./modules/canvas/services/ImageCleanup";

function App() {
  const theme = lightTheme;

  return (
    <ThemeProvider theme={lightTheme}>
      <Paper
        square
        className="root"
        style={{
          backgroundColor:
            theme.palette.type === "dark"
              ? theme.palette.background.default
              : theme.palette.background.default,
        }}
      >
        <Routes />
      </Paper>
    </ThemeProvider>
  );
}

export default App;
