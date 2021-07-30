import { RtpEncodingParameters } from "mediasoup-client/lib/types";

interface PeerMedia {
  paused: boolean;
  encodings: RtpEncodingParameters[];
}
export interface Peer {
  id: string;
  name: string;
  joinTs: number;
  lastSeenTs: number;
  media: Record<string, PeerMedia>;
  consumerLayers: Record<string, any>;
  stats: Record<string, any[] | any>;
}

export interface RoomState {
  // external
  peers: Record<string, Peer>;
  activeSpeaker: { producerId: null; volume: null; peerId: null };
}
