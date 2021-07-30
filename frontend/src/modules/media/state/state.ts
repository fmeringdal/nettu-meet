import {
  Consumer,
  detectDevice,
  Device,
  Producer,
  RtpCapabilities,
  Transport,
} from "mediasoup-client/lib/types";
import create from "zustand";
import { signalingChannel } from "../../../shared/services/theme/signalling";
import { RoomState } from "../services/PeersManager";
import { sig } from "./sig";

type ProducerStore = {
  webcam?: Producer;
  audio?: Producer;
  screen?: Producer;
  onStreamUpdate(localStreams: LocalStreamsStore): Promise<void>;
};

export const useProducerStore = create<ProducerStore>((set) => ({
  async onStreamUpdate(localStreams: LocalStreamsStore) {
    const handleProducerUpdate = async (media: keyof StreamConfig) => {
      if (localStreams.config[media]) {
        const mediaProducer = this[media];
        if (!mediaProducer || mediaProducer.closed) {
          const { transports } = useTransportStore.getState();
          if (!transports) return;
          // Create
          console.log("Creating " + media);
          this[media] = await transports.send.produce({
            track: localStreams[media].getTracks()[0],
            encodings: [],
            appData: { mediaTag: media },
          });
        } else if (mediaProducer.paused) {
          console.log("Resuming " + media);
          await sig("resume-producer", { producerId: mediaProducer.id });
          mediaProducer.resume();
        } else {
          // NOthing to do
        }
      } else {
        // If producer exists, then pause it
        const producer = this[media];
        if (producer) {
          if (media === "screen") {
            // Cannot pause screen because if user uses the browser native controls to stop screen
            // the browser will stop and delete the media tracks, and therefore the producer cannot be
            // resumed
            console.log("Closing " + media);
            await sig("close-producer", { producerId: producer.id });
            producer.close();
          } else {
            console.log("Pasuing " + media);
            await sig("pause-producer", { producerId: producer.id });
            producer.pause();
          }
        }
      }
    };
    await Promise.all([
      handleProducerUpdate("audio"),
      handleProducerUpdate("webcam"),
      handleProducerUpdate("screen"),
    ]);
  },
}));

type RoomStore = {
  joined: boolean;
  roomId: string;
  consumers: Record<string, Consumer[]>;
  room: RoomState;
  join(roomId: string, room: RoomState): void;
  addConsumer(consumer: Consumer): void;
  closeConsumer(consumerId: string): void;
  pauseConsumer(consumerId: string): void;
  resumeConsumer(consumerId: string): void;
  addNewPeer(peerId: string): void;
  removePeer(peerId: string): void;
};

// TODO: a peer id would be very useful here
const getConsumerById = (consumerId: string): Consumer | undefined => {
  const { consumers } = useRoomStore.getState();
  for (const peerConsumers of Object.values(consumers)) {
    for (const consumer of peerConsumers) {
      if (consumer.id === consumerId) {
        return consumer;
      }
    }
  }
};

export const useRoomStore = create<RoomStore>((set, get) => ({
  joined: false,
  roomId: "",
  consumers: {},
  room: {
    activeSpeaker: {
      producerId: null,
      peerId: null,
      volume: null,
    },
    peers: {},
  },
  join(roomId: string, room: RoomState) {
    set({
      roomId,
      room,
      joined: true,
    });
  },
  addConsumer(consumer: Consumer) {
    // console.log("adding consumer");
    // console.log(consumer);
    const { peerId } = consumer.appData;
    const consumers = get().consumers;
    if (peerId in consumers) {
      // Check if consumer already exists
      if (consumers[peerId].find((c) => c.id === consumer.id)) return;
      // Otherwise add it
      consumers[peerId].push(consumer);
    } else {
      consumers[peerId] = [consumer];
    }
    set({
      consumers,
    });
  },
  closeConsumer(consumerId: string) {
    const consumers = get().consumers;
    for (const peerId in consumers) {
      consumers[peerId] = consumers[peerId].filter((c) => c.id !== consumerId);
    }
    set({
      consumers,
    });
  },
  pauseConsumer(consumerId: string) {
    const consumer = getConsumerById(consumerId);
    if (!consumer) return;
    consumer.pause();
    // It is necessarry to manually trigger the state change
    const consumers = get().consumers;
    set({
      consumers,
    });
  },
  resumeConsumer(consumerId: string) {
    const consumer = getConsumerById(consumerId);
    if (!consumer) return;
    consumer.resume();
    // It is necessarry to manually trigger the state change
    const consumers = get().consumers;
    set({
      consumers,
    });
  },
  addNewPeer(peerId: string) {
    const { room } = get();
    if (peerId in room.peers) {
      return;
    }
    if (peerId === signalingChannel.id) {
      // Me
      return;
    }
    const peer = {
      consumerLayers: [],
      consumers: [],
      id: peerId,
      joinTs: new Date().valueOf(),
      lastSeenTs: new Date().valueOf(),
      media: {},
      stats: {},
    };
    room.peers[peerId] = peer;
    set({
      room,
    });
  },
  removePeer(peerId: string) {
    const { room } = get();
    delete room.peers[peerId];
    set({
      room,
    });
  },
}));

export const useActivePeerConsumers = () => {
  const { room, consumers } = useRoomStore();

  const activePeerConsumers = [];
  for (const peer of Object.values(room.peers)) {
    if (peer.id === signalingChannel.id) continue; // me
    const peerConsumers = peer.id in consumers ? consumers[peer.id] : [];
    activePeerConsumers.push({
      peerId: peer.id,
      consumers: peerConsumers.filter((c) => !c.closed && !c.paused),
    });
  }
  console.log("activePeerConsumers");
  console.log(activePeerConsumers);

  return activePeerConsumers;
};

type DeviceStore = {
  failed: boolean;
  device?: Device;
  init(routerRtpCapabilities: RtpCapabilities): Promise<boolean>;
};

export const useDeviceStore = create<DeviceStore>((set) => ({
  failed: false,
  async init(routerRtpCapabilities: RtpCapabilities) {
    if (this.device && this.device.loaded) {
      return false;
    }
    try {
      let handlerName = detectDevice();
      if (!handlerName) {
        console.warn(
          "mediasoup does not recognize this device, so ben has defaulted it to Chrome74"
        );
        handlerName = "Chrome74";
      }
      const device = new Device({ handlerName });
      await device.load({
        routerRtpCapabilities,
      });
      set({
        device,
      });
      return true;
    } catch {
      set({
        failed: true,
      });
      return false;
    }
  },
}));

interface Transports {
  send: Transport;
  recv: Transport;
}

type TransportStore = {
  transports?: Transports;
  init(transports: Transports): void;
};

export const useTransportStore = create<TransportStore>((set) => ({
  init(transports: Transports) {
    set({
      transports,
    });
  },
}));

type LocalStreamsStore = {
  combinedStream: MediaStream;
  audio: MediaStream;
  webcam: MediaStream;
  screen: MediaStream;
  config: StreamConfig;
  muteAudio(): void;
  unmuteAudio(): Promise<void>;
  muteWebcam(): void;
  unmuteWebcam(): Promise<void>;
  muteScreen(): void;
  unmuteScreen(): Promise<void>;
};

export const useLocalStreams = create<LocalStreamsStore>((set, get) => ({
  combinedStream: new MediaStream(),
  audio: new MediaStream(),
  webcam: new MediaStream(),
  screen: new MediaStream(),
  config: {
    audio: false,
    webcam: false,
    screen: false,
  },
  muteAudio() {
    const state = get();
    if (!state.config.audio) return;

    // state.audio.getTracks().forEach(t => t.stop());
    state.combinedStream.removeTrack(state.audio.getTracks()[0]);

    set({
      config: {
        ...state.config,
        audio: false,
      },
    });
  },
  async unmuteAudio() {
    const state = get();
    if (state.config.audio) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      stream.getTracks().forEach((t) => state.audio.addTrack(t));
      state.combinedStream.addTrack(state.audio.getTracks()[0]);
      set({
        config: {
          ...state.config,
          audio: true,
        },
      });
    } catch (error) {
      console.log(error);
      alert("Unable to capture audio");
    }
  },
  muteWebcam() {
    const state = get();
    if (!state.config.webcam) return;

    // state.webcam.getTracks().forEach(t => t.stop());
    state.combinedStream.removeTrack(state.webcam.getTracks()[0]);

    set({
      config: {
        ...state.config,
        webcam: false,
      },
    });
  },
  async unmuteWebcam() {
    let state = get();
    if (state.config.webcam) return;
    if (state.config.screen) {
      state.muteScreen();
    }
    state = get();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      stream.getTracks().forEach((t) => state.webcam.addTrack(t));
      state.combinedStream.addTrack(state.webcam.getTracks()[0]);
      set({
        config: {
          ...state.config,
          webcam: true,
        },
      });
    } catch (error) {
      console.log(error);
      alert("Unable to capture webcam");
    }
  },
  muteScreen() {
    const state = get();
    if (!state.config.screen) return;

    state.screen.getTracks().forEach((t) => t.stop());
    state.combinedStream.removeTrack(state.screen.getTracks()[0]);
    state.screen = new MediaStream();
    set({
      config: {
        ...state.config,
        screen: false,
      },
    });
  },
  async unmuteScreen() {
    let state = get();
    if (state.config.screen) return;
    if (state.config.webcam) {
      state.muteWebcam();
    }
    state = get();
    try {
      //@ts-ignore
      const stream: MediaStream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: true,
      });
      stream.getTracks().forEach((t) => {
        // Closed by browser native control
        t.onended = () => {
          get().muteScreen();
        };
        state.screen.addTrack(t);
      });
      state.combinedStream.addTrack(state.screen.getTracks()[0]);
      set({
        config: {
          ...state.config,
          screen: true,
        },
      });
    } catch (error) {
      console.log(error);
      alert("Unable top capture screen");
    }
  },
}));

useLocalStreams.subscribe((state) => {
  useProducerStore.getState().onStreamUpdate(state);
});

const hark = require("hark");

export interface StreamConfig {
  audio: boolean;
  webcam: boolean;
  screen: boolean;
}

export interface StreamSettings extends StreamConfig {
  videoConstraints?: MediaTrackSettings;
}
