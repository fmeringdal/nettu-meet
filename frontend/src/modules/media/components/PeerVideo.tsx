import { makeStyles, Typography } from "@material-ui/core";
import { MicOffRounded } from "@material-ui/icons";
import clsx from "clsx";
import { useCallback } from "react";
import { UserAvatar } from "../../user/components/Avatar";
import { StreamSettings } from "../state/state";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#202124",
    position: "relative",
  },
  border: {
    boxSizing: "border-box",
    padding: "8px",
  },
  darkBackground: {
    backgroundColor: "#121212",
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    flex: 1,
  },
  videoMirrored: {
    transform: "rotateY(180deg)",
    "-webkit-transform": "rotateY(180deg)" /* Safari and Chrome */,
    "-moz-transform": "rotateY(180deg)" /* Firefox */,
  },
  micAndName: {
    position: "absolute",
    left: "15px",
    bottom: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "30px",
    borderRadius: "4px",
    padding: "0 15px 0 8px",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  fullName: {
    fontSize: "0.8rem",
    color: "#fff",
    marginLeft: "6px",
  },
  noMic: {
    color: theme.palette.error.dark,
  },
}));

interface Props {
  fullName?: string;
  isSpeaking: boolean;
  stream: MediaStream;
  consumerIds: string[];
  streamSettings?: StreamSettings;
  isMe?: boolean;
  border?: boolean;
  darkBackground?: boolean;
  size: {
    width: number;
    height: number;
  };
}

export const PeerVideo = (props: Props) => {
  const classes = useStyles();

  const streamSettings: StreamSettings = props.streamSettings
    ? props.streamSettings
    : {
        audio: false,
        screen: false,
        webcam: false,
      };

  const isMe = Boolean(props.isMe);

  const mediaPlayerRef = useCallback(
    (node) => {
      if (node !== null) {
        node.srcObject = props.stream;
      }
    },
    [props.consumerIds.join("#")]
  );

  const displayMicAndName = (isMicActive: boolean) => (
    <div className={classes.micAndName}>
      <audio playsInline ref={mediaPlayerRef} muted={isMe} autoPlay />
      {isMicActive ? null : (
        <div className={classes.noMic}>
          <MicOffRounded
            style={{
              fontSize: "0.9rem",
            }}
          />
        </div>
      )}
      <Typography className={classes.fullName}>
        {props.fullName ? props.fullName : props.isMe ? "You" : "Participant"}
      </Typography>
    </div>
  );

  const displayWebcam = () => (
    <div className={classes.videoContainer}>
      <video
        autoPlay
        playsInline
        ref={mediaPlayerRef}
        muted={isMe}
        className={clsx(classes.video, {
          [classes.videoMirrored]: isMe && !streamSettings.screen,
        })}
        style={{
          width: streamSettings.screen ? "100%" : undefined,
          height: streamSettings.webcam ? "100%" : undefined,
          maxWidth: streamSettings.screen ? "100%" : undefined,
          maxHeight: streamSettings.screen ? "100%" : undefined,
          objectFit: streamSettings.screen ? "contain" : "cover",
        }}
      />
    </div>
  );

  const displayNoWebcam = () => (
    <div className="flex-center fill">
      <UserAvatar
        fullName={props.fullName}
        size="80px"
        isSpeaking={props.isSpeaking}
      />
    </div>
  );

  return (
    <div
      className={clsx(classes.container, {
        [classes.border]: props.border,
        [classes.darkBackground]: Boolean(props.darkBackground),
      })}
    >
      {streamSettings.webcam || streamSettings.screen
        ? displayWebcam()
        : displayNoWebcam()}
      {displayMicAndName(streamSettings.audio)}
    </div>
  );
};
