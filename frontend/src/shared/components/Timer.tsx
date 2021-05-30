import { Box, Typography, useTheme } from "@material-ui/core";
import TimeIcon from "@material-ui/icons/Timer";
import { useEffect, useState } from "react";

const pad = (counter: number) => (counter < 10 ? `0${counter}` : counter);

export const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [start, setStart] = useState(new Date().valueOf());

  const theme = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      const timenow = new Date().valueOf();
      const secs = Math.floor((timenow - start) / 1000);
      const minutes = Math.floor(secs / 60);
      setMinutes(minutes);
      setSeconds(secs % 60);
    }, 1000);
    return () => clearInterval(interval);
  }, [start]);

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Typography
        style={{
          fontSize: "1rem",
          marginRight: "7px",
        }}
        color="textPrimary"
      >
        {pad(minutes) + ":" + pad(seconds)}
      </Typography>
      <TimeIcon
        style={{
          color: theme.palette.type === "dark" ? "#fff" : "#323e49",
          opacity: "0.7",
          fontSize: "1.2rem",
        }}
      />
    </Box>
  );
};
