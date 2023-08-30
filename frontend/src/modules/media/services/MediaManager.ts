import { EventEmitter } from "events";
import { signalingChannel } from "../../../shared/services/theme/signalling";
import { StreamSettings } from "../state/state";
import { Device } from "mediasoup-client";
import {
  TransportOptions,
  Transport,
  Consumer,
  Producer,
} from "mediasoup-client/lib/types";
import { apiConfig } from "../../../config/api";
import { logger } from "../../../logger";

export interface Peer {
  peerId: string;
  consumers: Consumer[];
}

export class MediaManager extends EventEmitter {
  peers: Peer[];
  localStreamConfig: StreamSettings;
  device: Device;
  recvTransportOptions?: TransportOptions;
  recvTransport?: Transport;
  sendTransportOptions?: TransportOptions;
  sendTransport?: Transport;
  stream?: MediaStream;
  localVideoProducer?: Producer;
  joined: boolean;
  meetingId?: string;

  constructor() {
    super();
    this.joined = false;
    this.peers = [];
    this.device = new Device(); // TODO: try catch for device support
    this.localStreamConfig = {
      audio: false,
      screen: false,
      webcam: false,
    };
  }

  public updateStream(
    stream: MediaStream | undefined,
    config: StreamSettings,
    previousConfig: StreamSettings
  ) {
    if (!this.joined) return;
    if (stream == null && this.stream == null) return;
    this.stream = stream;

    if (config.screen || config.webcam) {
      // We are sharing video
      if (previousConfig.webcam && previousConfig.screen) {
        // Did not share video before
        // TODO: create producer
      } else if (
        config.screen !== previousConfig.screen ||
        config.webcam !== previousConfig.webcam
      ) {
        // Just replace old video track with new
        this.localVideoProducer!.replaceTrack({
          track: stream!.getVideoTracks()[0],
        });
      }
    } else if (previousConfig.screen || previousConfig.webcam) {
      this.localVideoProducer!.track?.stop();
      // No longer sharing video, but did before
      this.localVideoProducer!.close();
    }

    this.localStreamConfig = config;
  }

  public async start(stream: MediaStream | undefined, meetingId: string) {
    this.meetingId = meetingId;
    this.stream = stream;
    this.localStreamConfig = {
      audio: stream != null && stream.getAudioTracks().length > 0,
      webcam: stream != null && stream.getVideoTracks().length > 0,
      screen: false,
      videoConstraints:
        stream && stream.getVideoTracks().length > 0
          ? stream.getVideoTracks()[0].getSettings()
          : undefined,
    };

    this.setupSignallingListeners();
    signalingChannel.emit("join-room", meetingId);
    this.joined = true;
    try {
      // signal that we're a new peer and initialize our
      // mediasoup-client device, if this is our first time connecting
      const {
        routerRtpCapabilities,
        recvTransportOptions,
        sendTransportOptions,
      } = await this.sig("join", {
        peerId: signalingChannel.id,
        roomId: meetingId,
      });
      if (!this.device.loaded) {
        await this.device.load({ routerRtpCapabilities });
      }
      this.recvTransportOptions = recvTransportOptions;
      this.sendTransportOptions = sendTransportOptions;
      this.joined = true;
    } catch (e) {
      logger.error({error : e}, e);
      return;
    }

    // Fancy stuff
    // Check whether we can produce video to the router.
    if (!this.device.canProduce("video")) {
      console.warn("cannot produce video");

      // TODO: Better error handling
      return;
    }

    // Create the local representation of our server-side transport.
    this.sendTransport = this.device.createSendTransport({
      id: this.sendTransportOptions!.id,
      iceParameters: this.sendTransportOptions!.iceParameters,
      iceCandidates: this.sendTransportOptions!.iceCandidates,
      dtlsParameters: this.sendTransportOptions!.dtlsParameters,
      sctpParameters: this.sendTransportOptions!.sctpParameters,
    });

    this.recvTransport = this.device.createRecvTransport(
      this.recvTransportOptions!
    );

    // Set transport "connect" event handler.
    const transports = [
      { t: this.sendTransport, direction: "send" },
      { t: this.recvTransport, direction: "recv" },
    ];
    for (const transport of transports) {
      transport.t.on(
        "connect",
        async ({ dtlsParameters }, callback, errback) => {
          // Here we must communicate our local parameters to our remote transport.
          try {
            await this.sig("transport-connect", {
              roomId: meetingId,
              peerId: signalingChannel.id,
              direction: transport.direction,
              // transportId: sendTransport.id,
              dtlsParameters,
            });

            // Done in the server, tell our transport.
            callback();
          } catch (error) {
            // Something was wrong in server side.
            errback(error);
          }
        }
      );
    }

    // Set transport "produce" event handler.
    this.sendTransport.on(
      "produce",
      async ({ kind, rtpParameters, appData }, callback, errback) => {
        // Here we must communicate our local parameters to our remote transport.
        try {
          const { id } = await this.sig("send-track", {
            transportId: this.sendTransport!.id,
            kind,
            rtpParameters,
            appData,
            peerId: signalingChannel.id,
            roomId: meetingId,
          });

          // Done in the server, pass the response to our transport.
          callback({ id });
        } catch (error) {
          // Something was wrong in server side.
          errback(error);
        }
      }
    );

    // Produce our webcam video.
    if (stream) {
      const webcamTrack = stream.getVideoTracks()[0];
      this.localVideoProducer = await this.sendTransport.produce({
        track: webcamTrack,
      });
    }

    // Get existing tracks
    const { consumerParametersArr } = await this.sig("recv-tracks", {
      peerId: signalingChannel.id,
      roomId: meetingId,
      rtpCapabilities: this.device.rtpCapabilities,
    });

    for (const { peerId, consumerParameters } of consumerParametersArr) {
      if (consumerParameters == null) {
        this.peers.push({
          peerId,
          consumers: [],
        });
        continue;
      }
      const consumer = await this.recvTransport!.consume({
        ...consumerParameters,
        appData: { peerId },
      });

      // the server-side consumer will be started in paused state. wait
      // until we're connected, then send a resume request to the server
      // to get our first keyframe and start displaying video
      while (this.recvTransport.connectionState !== "connected") {
        logger.info({connectionState : this.recvTransport.connectionState}, 
          "  transport connstate" +
          this.recvTransport.connectionState
        );
        await new Promise((res) => setTimeout(() => res(""), 100));
      }

      let found = false;
      for (let i = 0; i < this.peers.length; i++) {
        if (this.peers[i].peerId === peerId) {
          this.peers[i].consumers.push(consumer);
          found = true;
          break;
        }
      }
      if (!found) {
        this.peers.push({
          peerId,
          consumers: [consumer],
        });
      }
      // okay, we're ready. let's ask the peer to send us media
      // await resumeConsumer(consumer);
      // consumer.resume();
    }
    this.emit("updatedPeers", this.peers);
  }

  private getPeer(peerId: string) {
    return this.peers.find(({ peerId: pId }) => pId === peerId);
  }

  private setupSignallingListeners() {
    signalingChannel.on("user-connected", async (peerId: string) => {
      const existingPC = this.getPeer(peerId);
      if (existingPC) return;
    });

    signalingChannel.on("new-track", async (data: any) => {
      alert(JSON.stringify(data));
    });

    signalingChannel.on("user-disconnected", (disconnectedPeerId: string) => {
      this.emit("updatedPeers", this.peers);
    });
  }

  public leave() {
    if (this.stream) {
      this.stream.getTracks().map((t) => t.stop());
    }
    signalingChannel.disconnect();
  }

  private async sig(endpoint: string, data: any): Promise<any> {
    try {
      const headers = { "Content-Type": "application/json" },
        body = JSON.stringify({ ...data, peerId: signalingChannel.id });

      const response = await fetch(
        apiConfig.baseUrl + "/signaling/" + endpoint,
        { method: "POST", body, headers }
      );
      return await response.json();
    } catch (e) {
      logger.error({error : e}, e);
      return { error: e };
    }
  }
}

export const mediaManager = new MediaManager();
