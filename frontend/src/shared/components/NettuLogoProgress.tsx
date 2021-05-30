import { createStyles, makeStyles } from "@material-ui/core";
import React from "react";
import NettuLogoImg from "../../assets/logos/NettuLetter.png";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
    },
    logo: {
      position: "absolute",
      left: "25px",
      right: "25px",
      top: "25px",
      bottom: "25px",
      overflow: "hidden",
      zIndex: 10,
      "& img": {
        width: "100%",
        height: "100%",
        objectFit: "contain",
      },
    },
    ldsRing: {
      display: "inline-block",
      position: "relative",
      width: "100%",
      height: "100%",
      backgroundColor: "#fff",
      boxShadow: "0 1px 6px 0 rgba(32,33,36,0.28)",
      borderRadius: "50%",
      "& div": {
        boxSizing: "border-box",
        display: "block",
        position: "absolute",
        width: "100%",
        height: "100%",
        border: "3px solid",
        borderRadius: "50%",
        animation: "$ldsRing 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        borderColor: "#1976d2 transparent transparent transparent",
      },
      "& div:nth-child(1)": {
        animationDelay: "-0.225s",
      },
      "& div:nth-child(2)": {
        animationDelay: "-0.15s",
      },
      "& div:nth-child(3)": {
        animationDelay: "-0.075s",
      },
    },
    "@keyframes ldsRing": {
      "0%": {
        transform: "rotate(0deg)",
      },
      "100%": {
        transform: "rotate(360deg)",
      },
    },
  })
);

export const NettuLogoProgress = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.logo}>
        <img src={NettuLogoImg} alt="" />
      </div>
      <div className={classes.ldsRing}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};
