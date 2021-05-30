import { LinearProgress, makeStyles, Paper } from "@material-ui/core";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { NettuLogoProgress } from "./NettuLogoProgress";

const useStyles = makeStyles((theme) => ({
  container: {
    position: "relative",
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  borderLinearProgress: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "6px",
  },
}));

interface Props {
  onDone: () => void;
  duration: number;
  style?: CSSProperties;
}

export const NettuProgress = (props: Props) => {
  const classes = useStyles();

  return (
    <Paper
      elevation={0}
      className={clsx(classes.container, classes.loading)}
      style={props.style}
    >
      <TopBorderProgress duration={props.duration} onDone={props.onDone} />
      <div style={{ width: "100px", height: "100px" }}>
        <NettuLogoProgress />
      </div>
    </Paper>
  );
};

const TopBorderProgress = (props: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const incremener = 1 / props.duration;
    const timer = setInterval(() => {
      const calcNewProgress = (old: number) => {
        if (old >= 250) {
          props.onDone();
          return 100;
        }
        if (old < 10) {
          //   return old + (4 / 3) * incremener; // props.duration = 1 takes 500 ms
          return old + 2 * incremener; // props.duration = 1 takes 500 ms
        }
        if (old < 30) {
          //   return old + (10 / 3) * incremener; // props.duration = 1 takes 400 ms
          return old + 6 * incremener; // props.duration = 1 takes 400 ms
        }
        if (old < 50) {
          //   return old + (20 / 3) * incremener; // props.duration = 1 takes 200 ms
          return old + 10 * incremener; // props.duration = 1 takes 200 ms
        }
        // return old + 10 * incremener; // props.duration = 1 takes 400 ms
        return old + 15 * incremener; // props.duration = 1 takes 400 ms
      };
      setProgress((prevProgress) => calcNewProgress(prevProgress));
    }, 100);
    return () => {
      clearInterval(timer);
    };
  }, [props]);

  return (
    <LinearProgress
      variant="determinate"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "6px",
      }}
      value={progress}
    />
  );
};
