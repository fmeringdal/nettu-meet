import { createStyles, makeStyles, Typography } from "@material-ui/core";
import { useState } from "react";
import NettuLetter from "../../assets/logos/NettuLetter.png";
import { meetingState } from "../../modules/meeting/state/meeting";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    logo: {
      height: "30px",
      "& img": {
        height: "100%",
        objectFit: "contain",
      },
    },
    logoLetter: {
      height: "35px",
      width: "35px",
      marginRight: "14px",
      borderRadius: "50%",
      backgroundColor: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      "& img": {
        height: "35px",
      },
    },
    logoTitle: {
      fontSize: "1rem",
      margin: 0,
      textOverflow: "ellipsis",
      maxWidth: "200px",
    },
  })
);

interface Props {
  label: string;
}

export const NettuLogoWithLabel = (props: Props) => {
  const classes = useStyles();

  const { meeting } = meetingState();
  const [imgLoadError, setImgLoadError] = useState(false);

  const imgSrc =
    meeting && meeting.account.iconURL && !imgLoadError
      ? meeting.account.iconURL
      : NettuLetter;

  return (
    <div className={classes.container}>
      <div className={classes.logoLetter}>
        <img src={imgSrc} alt="nettu" onError={() => setImgLoadError(true)} />
      </div>
      <Typography
        className={classes.logoTitle}
        color="textSecondary"
        align="left"
        noWrap
      >
        {props.label}
      </Typography>
    </div>
  );
};
