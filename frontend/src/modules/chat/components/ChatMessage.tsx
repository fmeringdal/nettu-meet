import { Avatar, Box, createStyles, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import { ChatMessage } from "../models/chat";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      margin: "30px 14px",
    },
    profilePicture: {
      marginRight: "16px",
      marginLeft: "16px",
      width: "40px",
      height: "40px",
    },
    messageContainer: {
      // backgroundColor:
      //   theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.16)" : "#f6f7fb",

      backgroundColor:
        theme.palette.type === "dark"
          ? "rgba(255, 255, 255, 0.16)"
          : theme.palette.background.default,
      color:
        theme.palette.type === "dark"
          ? theme.palette.text.secondary
          : "#737980",
      padding: "12px 15px",
      borderRadius: "8px",
      width: "400px",
    },
    myMessageContainer: {
      backgroundColor: "#3082ff",
      color: "#fff",
    },
  })
);

interface Props {
  sentByMe: boolean;
  message: ChatMessage;
}

export const ChatMessageComponent = (props: Props) => {
  const classes = useStyles();

  return (
    <div className={clsx(classes.root)}>
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="flex-start"
        flexDirection={props.sentByMe ? "row-reverse" : "row"}
      >
        <div className={classes.profilePicture}>
          <Avatar />
        </div>
        <div
          className={clsx(classes.messageContainer, {
            [classes.myMessageContainer]: props.sentByMe,
          })}
        >
          {props.message.content}
        </div>
      </Box>
    </div>
  );
};
