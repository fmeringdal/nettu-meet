import {
  AppBar,
  Box,
  Button,
  Grid,
  makeStyles,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { VideoCall } from "@material-ui/icons";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { NettuLogoWithLabel } from "../shared/components/NettuLogoWithLabel";
import VideoModusImg from "../assets/pictures/videomodus.png";
import CanvasImg from "../assets/pictures/canvas.png";
import { useState, useEffect, Fragment } from "react";
import { meetingService } from "../modules/meeting/services";
import { apiConfig, frontendUrl } from "../config/api";
import { GithubRepoBadge } from "../shared/components/GithubRepoBadge";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.palette.background.default,
  },
  appbar: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 0 1px 0 rgba(0,0,0,0.31), 0 3px 4px -2px rgba(0,0,0,0.25)",
  },
  body: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    top: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  left: {
    maxWidth: "35rem",
    display: "flex",
    height: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
    flexDirection: "column",
  },
  right: {},
  title: {
    fontSize: "2.75rem",
    paddingBottom: ".5em",
    lineHeight: "3.25rem",
    maxWidth: "35rem",
  },
  description: {
    fontSize: "1.125rem",
    lineHeight: "1.5rem",
    maxWidth: "30rem",
    marginBottom: "1em",
  },
  leftBtns: {
    display: "flex",
    alignItems: "center",
    marginTop: "3em",
  },
  joinBtnBtn: {
    border: "none",
    padding: 0,
    marginRight: "1.5rem",
  },
  joinBtn: {
    padding: "8px 12px",
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    fontWeight: 500,
    fontSize: ".875rem",
    letterSpacing: ".0107142857em",
    height: "3em",
    borderRadius: "4px",
    "&:hover": {
      boxShadow: theme.shadows[4],
      backgroundColor: theme.palette.primary.dark,
      cursor: "pointer",
    },
  },
  imageShow: {
    boxShadow:
      "0 1px 2px 0 rgba(60,64,67,0.302), 0 2px 6px 2px rgba(60,64,67,0.149)",
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "0.5rem",
    boxSizing: "border-box",
    overflow: "hidden",
    maxWidth: "60rem",
    padding: "0.5rem",
    "& img": {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "0.5rem",
    },
  },
  appbarEnd: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginLeft: "auto",
  },
  divider: {
    margin: "0 12px",
    height: "22px",
    width: "1px",
    backgroundColor: theme.palette.divider,
  },
}));

interface Props extends RouteComponentProps {}

const LandingPage = (props: Props) => {
  const classes = useStyles();

  const [imageIndex, setImageIndex] = useState(0);
  const theme = useTheme();

  const isMobileQuery = theme.breakpoints.down("xs");
  const isMobile = useMediaQuery(isMobileQuery);

  useEffect(() => {
    const i = setInterval(() => {
      setImageIndex((index) => (index + 1) % 2);
    }, 4000);
    return () => {
      clearInterval(i);
    };
  }, []);

  const createDemoMeeting = () => {
    const windowOpen = window.open();
    const move = async () => {
      const demo = await meetingService.createDemoMeeting();
      if (demo) {
        const location = `${frontendUrl}/meeting/${demo.getValue().meetingId}`;
        if (windowOpen) {
          // @ts-ignore
          windowOpen.location = location;
        } else {
          window.open(location);
        }
      } else {
        alert("Unable to create a demo meeting");
      }
    };
    move();
  };

  return (
    <div className={classes.container}>
      <AppBar className={classes.appbar} position="fixed">
        <Toolbar>
          <NettuLogoWithLabel label="Nettu Meet" />
          <div className={classes.appbarEnd}>
            <GithubRepoBadge />
            {!isMobile && (
              <Fragment>
                <Button
                  onClick={() => (window.location.href = apiConfig.docsUrl)}
                  size="small"
                  style={{
                    marginLeft: "24px",
                    fontWeight: 500,
                  }}
                >
                  Documentation
                </Button>
                <div className={classes.divider}></div>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => props.history.push("/create")}
                >
                  GET STARTED
                </Button>
              </Fragment>
            )}
          </div>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <div className={classes.body}>
        <div
          style={{
            padding: "0 30px",
            boxSizing: "border-box",
            width: "100%",
            maxWidth: "1550px",
            height: "100%",
            overflowY: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Grid
            container
            spacing={3}
            alignItems="center"
            style={{ height: "100%" }}
          >
            <Grid item md={5}>
              <div className={classes.left}>
                <Typography className={classes.title}>
                  Open source video conferencing for tutors
                </Typography>
                {/* <Typography
                  className={classes.description}
                  color="textSecondary"
                >
                  Nettu Meet is an open source video conference application
                  designed for interactive learning online.
                </Typography> */}
                {[
                  "Audio and video: Real-time sharing of audio and video.",
                  "Shared whiteboard: Collaborate with students on a shared whiteboard.",
                  "Screen sharing: Go to presenting mode by sharing your screen.",
                  "Chat: Send simple messages to other participants of the meeting.",
                  "File sharing: Upload relevant files to the meeting.",
                  "Graph plotter: Insert mathematical graphs to the whiteboard.",
                  "Customizable: Create an account and upload your own logos.",
                ].map((feature) => (
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      margin: "4px",
                    }}
                  >
                    <Typography
                      variant="body2"
                      style={{ fontWeight: 600, marginRight: "5px" }}
                    >
                      {feature.split(":")[0] + ":"}
                    </Typography>
                    <Typography variant="body2" style={{ fontWeight: 400 }}>
                      {feature.split(":")[1]}
                    </Typography>
                  </Box>
                ))}
                <div className={classes.leftBtns}>
                  <button
                    className={classes.joinBtnBtn}
                    onClick={() => createDemoMeeting()}
                  >
                    <div className={classes.joinBtn}>
                      <VideoCall
                        style={{
                          marginRight: "8px",
                        }}
                      />
                      <Typography>New meeting</Typography>
                    </div>
                  </button>
                  {isMobile && (
                    <Button
                      variant="outlined"
                      onClick={() => props.history.push("/create")}
                      style={{ height: "58px" }}
                    >
                      Create account
                    </Button>
                  )}
                </div>
              </div>
            </Grid>
            <Grid item md={7}>
              <div className={classes.right}>
                <div className={classes.imageShow}>
                  <img
                    src={imageIndex === 0 ? VideoModusImg : CanvasImg}
                    alt=""
                  />
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default withRouter(LandingPage);
