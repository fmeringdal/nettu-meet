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
import {logger} from '../../../logger';

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
          logger.info("Creating " + media);
          this[media] = await transports.send.produce({
            track: localStreams[media].getTracks()[0],
            encodings: [],
            appData: { mediaTag: media },
          });
        } else if (mediaProducer.paused) {
          logger.info("Resuming " + media);
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
            logger.info("Closing " + media);
            await sig("close-producer", { producerId: producer.id });
            producer.close();
          } else {
            logger.info("Pasuing " + media);
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
  addNewPeer(peerId: string, name: string): void;
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
  addNewPeer(peerId: string, name: string) {
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
      name,
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
      name: peer.name,
      consumers: peerConsumers.filter((c) => !c.closed && !c.paused),
    });
  }
  logger.info({activePeerConsumers : activePeerConsumers}, "activePeerConsumers");

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
  deviceConfig: DeviceConfig;
  availableDevices: {
    deviceId: string;
    label: string;
    kind: MediaDeviceKind;
  }[];
  muteAudio(): void;
  unmuteAudio(): Promise<void>;
  setAudioDevice(deviceId: string): Promise<void>;
  muteWebcam(): void;
  unmuteWebcam(): Promise<void>;
  setWebcamDevice(deviceId: string): Promise<void>;
  muteScreen(): void;
  unmuteScreen(): Promise<void>;
  setAvailableDevices(
    devices: {
      deviceId: string;
      label: string;
      kind: MediaDeviceKind;
    }[]
  ): Promise<void>;
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
  deviceConfig: {
    audio: undefined,
    webcam: undefined,
  },
  availableDevices: [],
  muteAudio() {
    const state = get();
    if (!state.config.audio) return;

    // state.audio.getTracks().forEach(t => t.stop());
    const track = state.audio.getTracks()[0];
    state.combinedStream.removeTrack(track);
    state.audio.removeTrack(track);

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
    if (!state.deviceConfig.audio) {
      alert("No devices found");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: state.deviceConfig.audio,
        },
      });
      const track = stream.getTracks()[0];
      state.audio.addTrack(track);
      state.combinedStream.addTrack(track);
      set({
        config: {
          ...state.config,
          audio: true,
        },
      });
    } catch (error) {
      logger.error({error:error}, "error");
      alert("Unable to capture audio");
    }
  },
  async setAudioDevice(deviceId: string) {
    const state = get();
    set({
      deviceConfig: {
        ...state.deviceConfig,
        audio: deviceId,
      },
    });
    if (state.config.audio) {
      get().muteAudio();
      await get().unmuteAudio();
    }
  },
  muteWebcam() {
    const state = get();
    if (!state.config.webcam) return;

    // state.webcam.getTracks().forEach(t => t.stop());
    const track = state.webcam.getTracks()[0];
    state.combinedStream.removeTrack(track);
    state.webcam.removeTrack(track);

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
    if (!state.deviceConfig.webcam) {
      alert("No devices found");
      return;
    }
    if (state.config.screen) {
      state.muteScreen();
    }
    state = get();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: state.deviceConfig.webcam,
        },
      });
      const track = stream.getTracks()[0];
      state.webcam.addTrack(track);
      state.combinedStream.addTrack(track);
      set({
        config: {
          ...state.config,
          webcam: true,
        },
      });
    } catch (error) {
      logger.error({error:error}, "error");
      alert("Unable to capture webcam");
    }
  },
  async setWebcamDevice(deviceId: string) {
    const state = get();
    set({
      deviceConfig: {
        ...state.deviceConfig,
        webcam: deviceId,
      },
    });
    if (state.config.webcam) {
      get().muteWebcam();
      await get().unmuteWebcam();
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
      logger.error({error:error}, "error");
      alert("Unable top capture screen");
    }
  },
  async setAvailableDevices(
    devices: { deviceId: string; label: string; kind: MediaDeviceKind }[]
  ) {
    // remove unidentified devices
    devices = devices.filter((device) => device.deviceId !== "");

    let state = get();
    set({
      availableDevices: devices,
    });

    const defaultAudioDevice = devices.find(
      (device) => device.kind === "audioinput"
    );
    const defaultWebcamDevice = devices.find(
      (device) => device.kind === "videoinput"
    );

    // audio device detected
    if (!state.deviceConfig.audio && defaultAudioDevice) {
      set({
        deviceConfig: {
          ...state.deviceConfig,
          audio: defaultAudioDevice.deviceId,
        },
      });
      state = get();
    }
    // device lost
    if (
      state.deviceConfig.audio &&
      !devices.find(
        (device) =>
          device.kind === "audioinput" &&
          device.deviceId === state.deviceConfig.audio
      )
    ) {
      get().muteAudio();
      set({
        deviceConfig: {
          ...get().deviceConfig,
          audio: undefined,
        },
      });

      logger.info({defaultAudioDevice:defaultAudioDevice},"Lost");

      // fallback to default
      if (defaultAudioDevice) {
        set({
          deviceConfig: {
            ...get().deviceConfig,
            audio: defaultAudioDevice.deviceId,
          },
        });
        get().unmuteAudio();
      }
      state = get();
    }

    // video device detected
    if (!state.deviceConfig.webcam && defaultWebcamDevice) {
      set({
        deviceConfig: {
          ...state.deviceConfig,
          webcam: defaultWebcamDevice.deviceId,
        },
      });
      state = get();
    }
    // device lost
    if (
      state.deviceConfig.webcam &&
      !devices.find(
        (device) =>
          device.kind === "videoinput" &&
          device.deviceId === state.deviceConfig.webcam
      )
    ) {
      get().muteWebcam();
      set({
        deviceConfig: {
          ...get().deviceConfig,
          webcam: undefined,
        },
      });

      // fallback to default
      if (defaultWebcamDevice) {
        set({
          deviceConfig: {
            ...get().deviceConfig,
            webcam: defaultWebcamDevice.deviceId,
          },
        });
        get().unmuteWebcam();
      }
      state = get();
    }
  },
}));

useLocalStreams.subscribe((state) => {
  useProducerStore.getState().onStreamUpdate(state);
});

const updateAvailableDevices = () => {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    useLocalStreams.getState().setAvailableDevices(devices);
  });
};

navigator.mediaDevices.ondevicechange = () => {
  updateAvailableDevices();
};

updateAvailableDevices();

export const requestPermissions = () => {
  navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(() => {
    updateAvailableDevices();
  });
};

const hark = require("hark");

export interface StreamConfig {
  audio: boolean;
  webcam: boolean;
  screen: boolean;
}

export interface DeviceConfig {
  audio?: string;
  webcam?: string;
}

export interface StreamSettings extends StreamConfig {
  videoConstraints?: MediaTrackSettings;
}
