import { makeStyles } from "@material-ui/core";
import { useEffect, useState } from "react";
import { signalingChannel } from "../../../shared/services/theme/signalling";
import {
  GetLayoutResponse,
  getVideoLayout,
  VIDEO_BOTTOMS_HEIGHT,
} from "../domain/layoutLogic";
import { useLocalStreams, useActivePeerConsumers } from "../state/state";
import { PeerVideo } from "./PeerVideo";

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: "#202124",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    overflow: "hidden",
  },
  bottomVideos: {
    height: `${VIDEO_BOTTOMS_HEIGHT}px`,
    borderTop: `2px solid ${theme.palette.divider}`,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
}));

interface Props {
  sidebarMode: boolean;
  size: {
    width: number;
    height: number;
  };
}

export const PeersVideoLayout = (props: Props) => {
  const classes = useStyles();
  const activePeerConsumers = useActivePeerConsumers();

  const { config, combinedStream } = useLocalStreams();
  const [mySpeakStats, setMySpeakStats] = useState({
    isSpeaking: false,
    speakingCount: 0,
  });

  const layout = getVideoLayout({
    peerStreams: [
      ...activePeerConsumers.map((p) => ({
        isMe: false,
        settings: {
          webcam: p.consumers.find((c) => c.track.kind === "video") != null,
          audio: p.consumers.find((c) => c.track.kind === "audio") != null,
          screen:
            p.consumers.find((c) => c.appData.mediaTag === "screen") != null,
        },
        isSpeaking: false,
        speakingCount: 0,
        data: {
          consumerIds: p.consumers.map((c) => c.id),
          stream: new MediaStream(p.consumers.map((c) => c.track.clone())),
          settings: {
            webcam: p.consumers.find((c) => c.track.kind === "video") != null,
            audio: p.consumers.find((c) => c.track.kind === "audio") != null,
            screen:
              p.consumers.find((c) => c.appData.mediaTag === "screen") != null,
          },
          isSpeaking: false,
          peerId: p.peerId,
          name: p.name,
        },
      })),
      {
        isMe: true,
        settings: config,
        isSpeaking: mySpeakStats.isSpeaking,
        speakingCount: mySpeakStats.speakingCount,
        data: {
          consumerIds: combinedStream.getTracks().map((t) => t.id),
          stream: combinedStream,
          settings: config,
          isSpeaking: mySpeakStats.isSpeaking,
          peerId: signalingChannel.id,
          name: "",
        },
      },
    ],
    sidebarMode: props.sidebarMode,
    size: props.size,
  });

  return (
    <div
      className={classes.container}
      style={{
        width: props.size.width + "px",
        height: props.size.height + "px",
      }}
    >
      {layout.mainVideos.map((p) => (
        <div
          key={p.data.peerId}
          style={{
            width: p.layout.size.width + "px",
            height: p.layout.size.height + "px",
          }}
        >
          <PeerVideo
            stream={p.data.stream}
            streamSettings={p.data.settings}
            isSpeaking={p.data.isSpeaking}
            isMe={p.isMe}
            fullName={p.data.name}
            consumerIds={p.data.consumerIds}
            darkBackground={layout.isPresentingMode}
            border={!props.sidebarMode && layout.mainVideos.length > 1}
            size={p.layout.size}
          />
        </div>
      ))}
      {layout.bottomVideos.length > 0 && (
        <div className={classes.bottomVideos}>
          {layout.bottomVideos.map((p) => (
            <div
              key={p.data.peerId}
              style={{
                width: p.layout.size.width + "px",
                height: p.layout.size.height + "px",
              }}
            >
              <PeerVideo
                stream={p.data.stream}
                isSpeaking={p.data.isSpeaking}
                streamSettings={p.data.settings}
                consumerIds={p.data.consumerIds}
                isMe={p.isMe}
                fullName={p.data.name}
                size={p.layout.size}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
