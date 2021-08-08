import os from 'os';
import { createWorker } from 'mediasoup';
import {
    AudioLevelObserver,
    Consumer,
    ConsumerStat,
    Producer,
    ProducerStat,
    Router,
    RtpEncodingParameters,
    WebRtcTransport,
    Worker,
} from 'mediasoup/lib/types';
import { config } from './config';
import {logger} from "../../../../logger"

const mediasoupWorkers: Worker[] = [];
const numWorkers = os.cpus().length;

let workerIdx = 0;
const getNextWorker = (): Worker => {
    const worker = mediasoupWorkers[workerIdx];
    workerIdx = (workerIdx + 1) % numWorkers;
    return worker;
};

/**
 * Launch as many mediasoup Workers as given in the configuration file.
 */
export async function runMediasoupWorkers(): Promise<void> {
    for (let i = 0; i < numWorkers; ++i) {
        const worker = await createWorker({
            logLevel: config.mediasoup.worker.logLevel,
            logTags: config.mediasoup.worker.logTags,
            rtcMinPort: config.mediasoup.worker.rtcMinPort,
            rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
        });

        worker.on('died', () => {
            logger.error({workerId : worker.pid}, 'mediasoup Worker died, exiting  in 2 seconds... [pid:%d]', worker.pid);

            setTimeout(() => process.exit(1), 2000);
        });

        mediasoupWorkers.push(worker);
    }
}

// Map of Room instances indexed by roomId.
export const rooms = new Map<string, RoomState>();

interface PeerMedia {
    paused: boolean;
    encodings: RtpEncodingParameters[];
}

interface PeerConsumerLayer {
    currentLayer?: number;
    clientSelectedLayer?: number;
}

interface Peer {
    id: string;
    name: string;
    // socket: Socket;
    joinTs: number;
    lastSeenTs: number;
    media: Record<string, PeerMedia>;
    consumerLayers: Record<string, PeerConsumerLayer>;
    stats: Record<string, ProducerStat[] | ConsumerStat>;
}

export interface RoomState {
    // external
    id: string;
    peers: Record<string, Peer>;
    activeSpeaker: { producerId: null; volume: null; peerId: null };
    // internal
    transports: Record<string, WebRtcTransport>;
    producers: Producer[];
    consumers: Consumer[];
    worker: Worker;
    router: Router;
    audioLevelObserver: AudioLevelObserver;
}

//
// and one "room" ...
//
export const createRoom = async (roomId: string): Promise<RoomState> => {
    const existingRoom = rooms.get(roomId);
    if (existingRoom) {
        return existingRoom;
    }
    logger.info({roomId : roomId}, 'Creating room: ' + roomId);

    const mediaCodecs = config.mediasoup.router.mediaCodecs;
    const worker = getNextWorker();
    const router = await worker.createRouter({ mediaCodecs });

    // audioLevelObserver for signaling active speaker
    //
    const audioLevelObserver = await router.createAudioLevelObserver({
        interval: 800,
    });
    audioLevelObserver.on('volumes', (volumes) => {
        const { producer, volume } = volumes[0];
        logger.info({peerId : producer.appData.peerId, volume : volume}, 'audio-level volumes event');
        const room = rooms.get(roomId);
        if (!room) return;
        room.activeSpeaker.producerId = producer.id;
        room.activeSpeaker.volume = volume;
        room.activeSpeaker.peerId = producer.appData.peerId;
    });
    audioLevelObserver.on('silence', () => {
        logger.info('audio-level silence event');
        const room = rooms.get(roomId);
        if (!room) return;
        room.activeSpeaker.producerId = null;
        room.activeSpeaker.volume = null;
        room.activeSpeaker.peerId = null;
    });
    const room = {
        // external
        id: roomId,
        peers: {},
        activeSpeaker: {
            producerId: null,
            volume: null,
            peerId: null,
        },
        // internal
        transports: {},
        producers: [],
        consumers: [],
        worker,
        router,
        audioLevelObserver,
    };
    rooms.set(roomId, room);
    return room;
};
