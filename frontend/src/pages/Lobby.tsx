/**
 * This is the entrypage where users will first arrive from the external application.
 * https://meet.nettu.no/:roomId/:code?
 * - roomId is the room which the user wants to access
 * - code is an optional param provided by the external application that can be used to retrieve user information
 * The entry page will just redirect the user and not display anything other than a splash screen
 * - if meetingroom is public then redirect to lobby with or without valid code
 * - if meetingroom is private then redirect to lobby if valid code otherwise to signup page
 */

import { Button, makeStyles, Paper, Tooltip } from "@material-ui/core";
import MicOffIcon from "@material-ui/icons/MicOffRounded";
import MicIcon from "@material-ui/icons/MicOutlined";
import VideoCamOffIcon from "@material-ui/icons/VideocamOffRounded";
import VideoCamIcon from "@material-ui/icons/VideocamOutlined";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { chatInteractor } from "../modules/chat/interactors/chatInteractor";
import { useSoundMeter } from "../modules/media/services/SoundMeter";
import { useLocalStreams } from "../modules/media/state/state";
import { joinRoom } from "../modules/media/state/utils";
import { meetingInteractor } from "../modules/meeting/interactors";
import { meetingState } from "../modules/meeting/state/meeting";
import { NettuLogoWithLabel } from "../shared/components/NettuLogoWithLabel";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    width: "700px",
    maxWidth: "95%",
  },
  header: {
    position: "fixed",
    left: 0,
    right: 0,
    top: 0,
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "16px 16px 0 16px",
  },
  videoPreview: {
    width: "100%",
    height: "420px",
    // maxWidth: "95%",
    boxShadow:
      "0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)",
    overflow: "hidden",
    borderRadius: "8px",
    backgroundColor: "#202124",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    "& video": {
      width: "100%",
      // height: "100%",
      flex: 1,
      transform: "rotateY(180deg)",
      "-webkit-transform": "rotateY(180deg)" /* Safari and Chrome */,
      "-moz-transform": "rotateY(180deg)" /* Firefox */,
    },
  },
  videPreviewFade: {
    height: "80px",
    position: "absolute",
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 1,
  },
  videPreviewFadeTop: {
    top: 0,
    backgroundImage:
      "-webkit-linear-gradient(top,rgba(0,0,0,0.7) 0,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0) 100%)",
  },
  videPreviewFadeBottom: {
    bottom: 0,
    backgroundImage:
      "-webkit-linear-gradient(bottom,rgba(0,0,0,0.7) 0,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0) 100%)",
  },
  controls: {
    margin: "30px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  control: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #d93025",
    backgroundColor: "#d93025",
    color: "#fff",
    margin: "0 7px",
    boxShadow: theme.shadows[2],
    "&:hover": {
      cursor: "pointer",
      boxShadow: theme.shadows[2],
    },
  },
  controlEnabled: {
    // backgroundColor: theme.palette.background.paper,
    // borderColor: "#999",
    // color: "#202124",
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main,
  },
}));

interface Props extends RouteComponentProps {}

const Lobby = (props: Props) => {
  const classes = useStyles();
  const videoRef = useRef<any>();

  const [config, setConfig] = useState({
    audio: false,
    video: false,
  });
  const [stream, setStream] = useState(new MediaStream());

  useEffect(() => {
    const getStream = async () => {
      try {
        if (config.audio || config.video) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: config.audio,
            video: config.video,
          });
          setStream(stream);
        } else {
          setStream(new MediaStream());
        }
      } catch (error) {
        alert("Unable to get media stream");
      }
    };
    getStream();
  }, [config]);

  const { meeting } = meetingState();

  const soundMeter = useSoundMeter(stream);

  useEffect(() => {
    if (videoRef && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const goToMeeting = async () => {
    if (meeting) {
      await joinRoom(meeting.id);

      const { unmuteAudio, unmuteWebcam } = useLocalStreams.getState();
      if (config.audio) {
        await unmuteAudio();
      }
      if (config.video) {
        await unmuteWebcam();
      }
      chatInteractor.setup();
      meetingInteractor.moveToMeetingRoom();
    } else {
      alert(
        "Unable to join meeting, meeting could not be found. Please refresh and try again."
      );
    }
  };

  const isMeetingBtnLinkActive = () => {
    if (stream != null) {
      return true;
    }
    return !config.audio && !config.video;
  };

  const soundTickers = new Array(100);
  for (let i = 1; i < 101; i++) {
    soundTickers.push(i * 0.01);
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <NettuLogoWithLabel label="Nettu Meet" />
      </div>
      <div className={classes.body}>
        <Paper className={classes.videoPreview}>
          <div
            className={clsx(
              classes.videPreviewFade,
              classes.videPreviewFadeTop
            )}
          ></div>
          <video ref={videoRef} id="tester" autoPlay muted></video>
          <div
            className={clsx(
              classes.videPreviewFade,
              classes.videPreviewFadeBottom
            )}
          ></div>
        </Paper>
        <div className={classes.controls}>
          <Tooltip
            placement="bottom"
            title={config.audio ? "Mute microphone" : "Unmute microphone"}
          >
            <div
              className={clsx(classes.control, {
                [classes.controlEnabled]: config.audio,
              })}
              onClick={() => setConfig({ ...config, audio: !config.audio })}
            >
              {config.audio ? <MicIcon /> : <MicOffIcon />}
            </div>
          </Tooltip>

          <Tooltip
            placement="bottom"
            title={config.audio ? "Turn off webcam" : "Turn on webcam"}
          >
            <div
              className={clsx(classes.control, {
                [classes.controlEnabled]: config.video,
              })}
              onClick={() => setConfig({ ...config, video: !config.video })}
            >
              {config.video ? <VideoCamIcon /> : <VideoCamOffIcon />}
            </div>
          </Tooltip>
        </div>
        {config.audio && (
          <div className="flex-center" style={{ margin: "20px" }}>
            {soundTickers.map((i) => (
              <div
                key={i}
                style={{
                  width: "2px",
                  height: "10px",
                  margin: "1px",
                  backgroundColor:
                    i <= soundMeter.meter ? "#69ce2b" : "#e6e7e8",
                }}
              ></div>
            ))}
          </div>
        )}
        <Button
          color="primary"
          // disableElevation
          variant="contained"
          size="large"
          fullWidth
          disabled={!isMeetingBtnLinkActive()}
          onClick={() => goToMeeting()}
        >
          JOIN MEETING
        </Button>
      </div>
    </div>
  );
};

export default withRouter(Lobby);
