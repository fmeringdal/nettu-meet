import { StreamSettings } from "../state/state";

export const VIDEO_BOTTOMS_HEIGHT = 120;
export const VIDEO_BOTTOMS_MAX_WIDTH = (VIDEO_BOTTOMS_HEIGHT * 4) / 3;

interface PeerStream<T> {
  isMe: boolean;
  isSpeaking: boolean;
  speakingCount: number;
  settings?: StreamSettings;
  data: T;
}

export interface GetLayoutRequest<T> {
  sidebarMode: boolean;
  size: {
    width: number;
    height: number;
  };
  peerStreams: PeerStream<T>[];
}

interface PeerLayout<T> {
  isMe: boolean;
  layout: {
    size: {
      width: number;
      height: number;
    };
  };
  _priority: number;
  data: T;
}

export interface GetLayoutResponse<T> {
  mainVideos: PeerLayout<T>[];
  bottomVideos: PeerLayout<T>[];
  isPresentingMode: boolean;
}

/**
 * POSSIBLE IMPROVEMENTS
 * 1. me video placed more intelligentely
 * 2. priority to users who have video or audio enabled or is talking
 */

export function getVideoLayout<T>(
  req: GetLayoutRequest<T>
): GetLayoutResponse<T> {
  const someoneIsSharingScreen =
    req.peerStreams.find((p) => p.settings != null && p.settings.screen) !=
    null;
  const res: GetLayoutResponse<T> = {
    mainVideos: [],
    bottomVideos: [],
    isPresentingMode: someoneIsSharingScreen,
  };
  if (someoneIsSharingScreen) {
    for (const pc of req.peerStreams) {
      const settings = pc.settings;
      const sharingScreen = settings && settings.screen;
      if (sharingScreen && res.mainVideos.length === 0) {
        res.mainVideos.push({
          layout: {
            size: {
              width: req.size.width,
              height:
                req.size.height -
                (req.peerStreams.length > 1 ? VIDEO_BOTTOMS_HEIGHT : 0),
            },
          },
          isMe: Boolean(pc.isMe),
          data: pc.data,
          _priority: getPeerPriority(pc),
        });
      } else {
        res.bottomVideos.push({
          layout: {
            size: {
              width: Math.min(
                req.size.width / Math.max(1, req.peerStreams.length - 1),
                VIDEO_BOTTOMS_MAX_WIDTH
              ),
              height: VIDEO_BOTTOMS_HEIGHT,
            },
          },
          isMe: Boolean(pc.isMe),
          data: pc.data,
          _priority: getPeerPriority(pc),
        });
      }
    }
  } else {
    const peersCount = req.peerStreams.length;
    let counter = 0;
    let peersPerRow = peersCount >= 7 ? 3 : peersCount > 1 ? 2 : 1;
    let peersPerColumn = peersCount >= 5 ? 3 : peersCount > 2 ? 2 : 1;
    if (req.sidebarMode && peersCount === 2) {
      peersPerColumn = 2;
      peersPerRow = 1;
    }
    const mainVideosHeight =
      peersCount > 9 ? req.size.height - VIDEO_BOTTOMS_HEIGHT : req.size.height;

    for (const pc of req.peerStreams) {
      if (counter < 9) {
        res.mainVideos.push({
          layout: {
            size: {
              width: req.size.width / peersPerRow,
              height: mainVideosHeight / peersPerColumn,
            },
          },
          isMe: Boolean(pc.isMe),
          data: pc.data,
          _priority: getPeerPriority(pc),
        });
      } else {
        res.bottomVideos.push({
          layout: {
            size: {
              width: Math.min(
                req.size.width / Math.max(1, req.peerStreams.length - 9),
                VIDEO_BOTTOMS_MAX_WIDTH
              ),
              height: VIDEO_BOTTOMS_HEIGHT,
            },
          },
          isMe: Boolean(pc.isMe),
          data: pc.data,
          _priority: getPeerPriority(pc),
        });
      }
      counter += 1;
    }
  }

  if (req.peerStreams.length > 9) {
    res.mainVideos.sort((v1, v2) => v2._priority - v1._priority);
    res.bottomVideos.sort((v1, v2) => v2._priority - v1._priority);
  }

  return res;
}

export const getPeerPriority = (req: PeerStream<any>): number => {
  let priority = 0;
  if (req.isSpeaking) {
    priority += 25;
  }
  priority += Math.min(req.speakingCount, 7);
  if (req.settings && req.settings.webcam) {
    priority += 15;
  }
  if (req.settings && req.settings.audio) {
    priority += 10;
  }

  return priority;
};
