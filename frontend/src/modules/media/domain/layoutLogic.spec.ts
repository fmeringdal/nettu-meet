import {
  getVideoLayout,
  VIDEO_BOTTOMS_HEIGHT,
  VIDEO_BOTTOMS_MAX_WIDTH,
} from "./layoutLogic";

describe("Video layout logic", () => {
  it("should fill all space when only one user", () => {
    for (const sidebarMode of [true, false]) {
      const layout = getVideoLayout({
        peerStreams: [
          {
            isMe: true,
            settings: {
              audio: true,
              screen: false,
              webcam: true,
            },
            data: undefined,
            isSpeaking: false,
            speakingCount: 0,
          },
        ],
        sidebarMode,
        size: {
          width: 100,
          height: 100,
        },
      });

      expect(layout.mainVideos.length).toBe(1);
      expect(layout.bottomVideos.length).toBe(0);
      expect(layout.mainVideos[0].layout.size).toEqual({
        width: 100,
        height: 100,
      });
    }
  });

  it("should split horizonally when two users in video mode", () => {
    const layout = getVideoLayout({
      peerStreams: [
        {
          isMe: true,
          settings: {
            audio: true,
            screen: false,
            webcam: true,
          },
          data: undefined,
          isSpeaking: false,
          speakingCount: 0,
        },
        {
          isMe: false,
          settings: {
            audio: true,
            screen: false,
            webcam: true,
          },
          data: undefined,
          isSpeaking: false,
          speakingCount: 0,
        },
      ],
      sidebarMode: false,
      size: {
        width: 100,
        height: 100,
      },
    });

    expect(layout.mainVideos.length).toBe(2);
    expect(layout.bottomVideos.length).toBe(0);
    expect(layout.mainVideos[0].layout.size).toEqual({
      width: 50,
      height: 100,
    });
    expect(layout.mainVideos[1].layout.size).toEqual({
      width: 50,
      height: 100,
    });
  });

  it("should split vertically when two users in sidebarmode", () => {
    const layout = getVideoLayout({
      peerStreams: [
        {
          isMe: true,
          settings: {
            audio: true,
            screen: false,
            webcam: true,
          },
          data: undefined,
          isSpeaking: false,
          speakingCount: 0,
        },
        {
          isMe: false,
          settings: {
            audio: true,
            screen: false,
            webcam: true,
          },
          data: undefined,
          isSpeaking: false,
          speakingCount: 0,
        },
      ],
      sidebarMode: true,
      size: {
        width: 100,
        height: 100,
      },
    });

    expect(layout.mainVideos.length).toBe(2);
    expect(layout.bottomVideos.length).toBe(0);
    expect(layout.mainVideos[0].layout.size).toEqual({
      width: 100,
      height: 50,
    });
    expect(layout.mainVideos[1].layout.size).toEqual({
      width: 100,
      height: 50,
    });
  });

  it("should just use mainvideos place when 4 videos and split 2x2", () => {
    for (const sidebarMode of [true, false]) {
      const layout = getVideoLayout({
        peerStreams: [0, 1, 2, 3].map((i) => ({
          isMe: i === 0,
          settings: {
            audio: true,
            screen: false,
            webcam: true,
          },
          data: undefined,
          isSpeaking: false,
          speakingCount: 0,
        })),
        sidebarMode,
        size: {
          width: 100,
          height: 100,
        },
      });

      expect(layout.mainVideos.length).toBe(4);
      expect(layout.bottomVideos.length).toBe(0);
      for (const v of layout.mainVideos) {
        expect(sizeToFixed(v.layout.size)).toEqual({
          width: "50.0",
          height: "50.0",
        });
      }
    }
  });

  it("should just use mainvideos place when 5 videos and split 2,2,1 in video mode", () => {
    for (const sidebarMode of [true, false]) {
      const layout = getVideoLayout({
        peerStreams: [0, 1, 2, 3, 4].map((i) => ({
          isMe: i === 0,
          settings: {
            audio: true,
            screen: false,
            webcam: true,
          },
          isSpeaking: false,
          speakingCount: 0,
          data: undefined,
        })),
        sidebarMode,
        size: {
          width: 100,
          height: 100,
        },
      });

      expect(layout.mainVideos.length).toBe(5);
      expect(layout.bottomVideos.length).toBe(0);
      for (const v of layout.mainVideos) {
        expect(sizeToFixed(v.layout.size)).toEqual({
          width: "50.0",
          height: "33.3",
        });
      }
    }
  });

  it("should correctly layout 7 videos and split 3,3,1 in video mode", () => {
    for (const sidebarMode of [true, false]) {
      const layout = getVideoLayout({
        peerStreams: [0, 1, 2, 3, 4, 5, 6].map((i) => ({
          isMe: i === 0,
          settings: {
            audio: true,
            screen: false,
            webcam: true,
          },
          isSpeaking: false,
          speakingCount: 0,
          data: undefined,
        })),
        sidebarMode,
        size: {
          width: 100,
          height: 100,
        },
      });

      expect(layout.mainVideos.length).toBe(5);
      expect(layout.bottomVideos.length).toBe(0);
      for (const v of layout.mainVideos) {
        expect(sizeToFixed(v.layout.size)).toEqual({
          width: "33.3",
          height: "33.3",
        });
      }
    }
  });

  it("should just use mainvideos place when 9 videos and split 3x3", () => {
    for (const sidebarMode of [true, false]) {
      const layout = getVideoLayout({
        peerStreams: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
          isMe: i === 0,
          settings: {
            audio: true,
            screen: false,
            webcam: true,
          },
          data: undefined,
          isSpeaking: false,
          speakingCount: 0,
        })),
        sidebarMode,
        size: {
          width: 100,
          height: 100,
        },
      });

      expect(layout.mainVideos.length).toBe(9);
      expect(layout.bottomVideos.length).toBe(0);
      for (const v of layout.mainVideos) {
        expect(sizeToFixed(v.layout.size)).toEqual({
          width: "33.3",
          height: "33.3",
        });
      }
    }
  });

  it("should use bottomvideos place when 11 videos, and correctly scale main and bottom videos", () => {
    for (const sidebarMode of [true, false]) {
      const layout = getVideoLayout({
        peerStreams: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => ({
          isMe: i === 0,
          settings: {
            audio: true,
            screen: false,
            webcam: true,
          },
          data: undefined,
          isSpeaking: false,
          speakingCount: 0,
        })),
        sidebarMode,
        size: {
          width: 1000,
          height: 1000 + VIDEO_BOTTOMS_HEIGHT,
        },
      });

      expect(layout.mainVideos.length).toBe(9);
      expect(layout.bottomVideos.length).toBe(2);
      for (const v of layout.mainVideos) {
        expect(sizeToFixed(v.layout.size)).toEqual({
          width: "333.3",
          height: "333.3",
        });
      }
      for (const v of layout.bottomVideos) {
        expect(sizeToFixed(v.layout.size)).toEqual({
          width: VIDEO_BOTTOMS_MAX_WIDTH + ".0",
          height: VIDEO_BOTTOMS_HEIGHT + ".0",
        });
      }
    }
  });

  it("should use present mode when one is presenting", () => {
    for (const sidebarMode of [true, false]) {
      const layout = getVideoLayout({
        peerStreams: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => ({
          isMe: i === 0,
          settings: {
            audio: true,
            screen: i === 2,
            webcam: false,
          },
          isSpeaking: false,
          speakingCount: 0,
          data: i,
        })),
        sidebarMode,
        size: {
          width: 1000,
          height: 1000 + VIDEO_BOTTOMS_HEIGHT,
        },
      });

      expect(layout.mainVideos.length).toBe(1);
      expect(layout.bottomVideos.length).toBe(10);
      for (const v of layout.mainVideos) {
        expect(sizeToFixed(v.layout.size)).toEqual({
          width: "1000.0",
          height: "1000.0",
        });
        expect(v.data).toBe(2); // Correct screen sharer
      }
      for (const v of layout.bottomVideos) {
        expect(sizeToFixed(v.layout.size)).toEqual({
          width: "100.0",
          height: VIDEO_BOTTOMS_HEIGHT + ".0",
        });
      }
    }
  });

  it("should use present mode when more than one is presenting and only show one screen", () => {
    for (const sidebarMode of [true, false]) {
      const layout = getVideoLayout({
        peerStreams: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => ({
          isMe: i === 0,
          settings: {
            audio: true,
            screen: i === 2 || i === 5,
            webcam: false,
          },
          isSpeaking: false,
          speakingCount: 0,
          data: i,
        })),
        sidebarMode,
        size: {
          width: 1000,
          height: 1000 + VIDEO_BOTTOMS_HEIGHT,
        },
      });

      expect(layout.mainVideos.length).toBe(1);
      expect(layout.bottomVideos.length).toBe(10);
      for (const v of layout.mainVideos) {
        expect(sizeToFixed(v.layout.size)).toEqual({
          width: "1000.0",
          height: "1000.0",
        });
        expect(v.data).toBe(2); // Correct screen sharer
      }
      for (const v of layout.bottomVideos) {
        expect(sizeToFixed(v.layout.size)).toEqual({
          width: "100.0",
          height: VIDEO_BOTTOMS_HEIGHT + ".0",
        });
      }
    }
  });
});

const sizeToFixed = (
  size: { width: number; height: number },
  fractionDigits: number = 1
) => {
  return {
    width: size.width.toFixed(fractionDigits),
    height: size.height.toFixed(fractionDigits),
  };
};
