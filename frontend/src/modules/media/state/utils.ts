import {
  Device,
  RtpEncodingParameters,
  Transport,
  TransportOptions,
} from "mediasoup-client/lib/types";
import { sig } from "./sig";
import { signalingChannel } from "../../../shared/services/theme/signalling";
import { useRoomStore, useDeviceStore, useTransportStore } from "./state";
import {logger} from '../../../logger'

interface PeerMedia {
  paused: boolean;
  encodings: RtpEncodingParameters[];
}
export interface Peer {
  id: string;
  joinTs: number;
  lastSeenTs: number;
  media: Record<string, PeerMedia>;
  consumerLayers: Record<string, any>;
  stats: Record<string, any[] | any>;
}

export interface RoomState {
  // external
  peers: Record<string, Peer>;
  activeSpeaker: {
    producerId: null;
    volume: null;
    peerId: null;
  };
}

window.addEventListener("unload", () => sig("leave", {}));

//
// meeting control actions
//
export const joinRoom = async (roomId: string, name: string) => {
  const { joined, join } = useRoomStore.getState();
  if (joined) {
    return;
  }
  setupSignallingListeners(roomId);

  logger.info('join room');

  // signal that we're a new peer and initialize our
  // mediasoup-client device, if this is our first time connecting
  const {
    routerRtpCapabilities,
    sendTransportOptions,
    recvTransportOptions,
  } = await sig("join-as-new-peer", {
    roomId,
    name,
  });

  const success = await useDeviceStore.getState().init(routerRtpCapabilities);
  if (!success) {
    return;
  }
  const { device } = useDeviceStore.getState();
  const [sendTransport, recvTransport] = await Promise.all([
    createTransport("send", sendTransportOptions, device!, roomId),
    createTransport("recv", recvTransportOptions, device!, roomId),
  ]);

  useTransportStore.getState().init({
    send: sendTransport,
    recv: recvTransport,
  });

  const { peers, activeSpeaker, error } = await sig("sync", { roomId });
  if (error) {
    return { error };
  }

  join(roomId, {
    activeSpeaker,
    peers,
  });

  await sig("init-consumers", {
    peerId: signalingChannel.id,
    roomId,
  });
};

export const leaveRoom = async () => {
  const { joined } = useRoomStore.getState();
  if (!joined) {
    return;
  }

  logger.info("leave room");

  // close everything on the server-side (transports, producers, consumers)
  const { error } = await sig("leave", {});
  if (error) {
    logger.error({error : error}, "error");
  }

  const { transports } = useTransportStore.getState();

  // closing the transports closes all producers and consumers. we
  // don't need to do anything beyond closing the transports, except
  // to set all our local variables to their initial states
  try {
    if (transports) {
      transports.send.close();
      transports.recv.close();
    }
  } catch (e) {
    logger.error({error : e}, "error");
  }
  // this.recvTransport = undefined;
  // this.sendTransport = undefined;
  // this.camVideoProducer = undefined;
  // this.audioProducer = undefined;
  // this.screenVideoProducer = undefined;
  // this.localCam = undefined;
  // this.localScreen = undefined;
  // this.consumers = [];
  // this.joined = false;
};

async function pauseConsumer(consumerId: string) {
  logger.info({consumerId : consumerId}, "pause consumer");
  try {
    await sig("pause-consumer", { consumerId });
    useRoomStore.getState().pauseConsumer(consumerId);
    // this.update();
  } catch (e) {
    logger.error({error: e}, "error");
  }
}

async function resumeConsumer(consumerId: string) {
  logger.info("resume consumer", consumerId);
  try {
    await sig("resume-consumer", { consumerId });
    useRoomStore.getState().resumeConsumer(consumerId);
    // this.update();
  } catch (e) {
    logger.error({error: e}, "error");
  }
}

async function closeConsumer(consumerId: string) {
  logger.info({consumerId:consumerId}, "close consumer");
  try {
    // tell the server we're closing this consumer. (the server-side
    // consumer may have been closed already, but that's okay.)
    await sig("close-consumer", { consumerId });

    useRoomStore.getState().closeConsumer(consumerId);
    // this.update();
  } catch (e) {
    logger.error({error: e}, "error");
  }
}

// utility function to create a transport and hook up signaling logic
// appropriate to the transport's direction
//
async function createTransport(
  direction: string,
  transportOptions: TransportOptions,
  device: Device,
  roomId: string
): Promise<Transport> {
  // ask the server to create a server-side transport object and send
  // us back the info we need to create a client-side transport
  let transport: Transport;
  logger.info({transportOptions : transportOptions}, "transport options");

  if (direction === "recv") {
    transport = device.createRecvTransport(transportOptions);
  } else if (direction === "send") {
    transport = device.createSendTransport(transportOptions);
  } else {
    throw new Error(`bad transport 'direction': ${direction}`);
  }

  // mediasoup-client will emit a connect event when media needs to
  // start flowing for the first time. send dtlsParameters to the
  // server, then call callback() on success or errback() on failure.
  transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
    logger.info({direction : direction}, "transport connect event");
    const { error } = await sig("connect-transport", {
      transportId: transportOptions.id,
      dtlsParameters,
    });
    if (error) {
      logger.error({direction : direction, error : error}, "error connecting transport");
      errback();
      return;
    }
    callback();
  });

  if (direction === "send") {
    // sending transports will emit a produce event when a new track
    // needs to be set up to start sending. the producer's appData is
    // passed as a parameter
    transport.on(
      "produce",
      async ({ kind, rtpParameters, appData }, callback, errback) => {
        logger.info({mediaTag : appData.mediaTag}, "transport produce event");
        // we may want to start out paused (if the checkboxes in the ui
        // aren't checked, for each media type. not very clean code, here
        // but, you know, this isn't a real application.)
        // let paused = false;
        let paused = false;
        // tell the server what it needs to know from us in order to set
        // up a server-side producer object, and get back a
        // producer.id. call callback() on success or errback() on
        // failure.
        const { error, id } = await sig("send-track", {
          transportId: transportOptions.id,
          kind,
          rtpParameters,
          paused,
          appData,
          roomId,
        });
        if (error) {
          logger.error({error:error}, "error setting up server-side producer");
          errback();
          return;
        }
        callback({ id });
      }
    );
  }

  // for this simple demo, any time a transport transitions to closed,
  // failed, or disconnected, leave the room and reset
  //
  transport.on("connectionstatechange", async (state) => {
    logger.info(`transport ${transport.id} connectionstatechange ${state}`);
    // for this simple sample code, assume that transports being
    // closed is an error (we never close these transports except when
    // we leave the room)
    if (state === "closed" || state === "failed" || state === "disconnected") {
      logger.info("transport closed ... leaving the room and resetting");
      leaveRoom();
    }
  });

  return transport;
}

const setupSignallingListeners = (roomId: string) => {
  signalingChannel.emit("join-room", roomId);
  signalingChannel.on("user-connected", async (peerId: string) => {});

  signalingChannel.on("user-disconnected", (disconnectedPeerId: string) => {});

  signalingChannel.on("consumerPaused", (data: { consumerId: string }) => {
    pauseConsumer(data.consumerId);
  });

  signalingChannel.on("consumerResumed", (data: { consumerId: string }) => {
    resumeConsumer(data.consumerId);
  });
  signalingChannel.on("consumerClosed", (data: { consumerId: string }) => {
    closeConsumer(data.consumerId);
  });

  // New
  signalingChannel.on("newPeer", (data: any) => {
    const { peerId, name } = data;
    useRoomStore.getState().addNewPeer(peerId, name);
  });
  signalingChannel.on("peerClosed", (data: any) => {
    const { peerId } = data;
    useRoomStore.getState().removePeer(peerId);
  });
  signalingChannel.on("activeSpeaker", (data: any) => {
    logger.info({
      topic: "activeSpeaker",
      data,
    });
  });
  signalingChannel.on("newConsumer", async (data: any) => {
    const { joined } = useRoomStore.getState();
    if (!joined) return;
    const {
      peerId,
      producerId,
      id,
      kind,
      rtpParameters,
      type,
      appData,
      producerPaused,
    } = data;
    const { transports } = useTransportStore.getState();
    if (!transports) return;

    const consumer = await transports.recv.consume({
      id,
      producerId,
      kind,
      rtpParameters,
      appData: { ...appData, peerId }, // Trick.
    });

    useRoomStore.getState().addConsumer(consumer);

    // the server-side consumer will be started in paused state. wait
    // until we're connected, then send a resume request to the server
    // to get our first keyframe and start displaying video
    while (transports.recv.connectionState !== "connected") {
      logger.info({connectionState : transports.recv.connectionState},"  transport connstate");
      await sleep(100);
    }

    if (!producerPaused) {
      // okay, we're ready. let's ask the peer to send us media
      await resumeConsumer(consumer.id);
    } else {
      await pauseConsumer(consumer.id);
    }

    consumer.on("transportclose", () => {
      closeConsumer(consumer.id);
    });
  });
};

//
// promisified sleep
//
async function sleep(ms: number) {
  return new Promise((r) => setTimeout(() => r(""), ms));
}
