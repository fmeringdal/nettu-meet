import { RtpCodecCapability, TransportListenIp, WorkerSettings } from 'mediasoup/lib/types';
import { isProduction } from '../../../../config';

export const config = {
    // http server ip, port, and peer timeout constant
    //
    httpIp: '0.0.0.0',
    httpPort: isProduction ? 443 : 5000,
    httpPeerStale: 15000,

    // ssl certs. we'll start as http instead of https if we don't have
    // these
    sslCrt: 'local.crt',
    sslKey: 'local.key',

    mediasoup: {
        worker: {
            rtcMinPort: 40000,
            rtcMaxPort: 49999,
            logLevel: 'debug',
            logTags: [
                'info',
                'ice',
                'dtls',
                'rtp',
                'srtp',
                'rtcp',
                // 'rtx',
                // 'bwe',
                // 'score',
                // 'simulcast',
                // 'svc'
            ],
        } as WorkerSettings,
        router: {
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {
                        //                'x-google-start-bitrate': 1000
                    },
                },
                {
                    kind: 'video',
                    mimeType: 'video/h264',
                    clockRate: 90000,
                    parameters: {
                        'packetization-mode': 1,
                        'profile-level-id': '4d0032',
                        'level-asymmetry-allowed': 1,
                        //						  'x-google-start-bitrate'  : 1000
                    },
                },
                {
                    kind: 'video',
                    mimeType: 'video/h264',
                    clockRate: 90000,
                    parameters: {
                        'packetization-mode': 1,
                        'profile-level-id': '42e01f',
                        'level-asymmetry-allowed': 1,
                        //						  'x-google-start-bitrate'  : 1000
                    },
                },
            ] as RtpCodecCapability[],
        },

        // rtp listenIps are the most important thing, below. you'll need
        // to set these appropriately for your network for the demo to
        // run anywhere but on localhost
        webRtcTransport: {
            listenIps: [
                {
                    ip: process.env.LISTEN_IP,
                    announcedIp: process.env.ANNOUNCEMENT_IP,
                },
                // { ip: '127.0.0.1', announcedIp: '192.168.65.1' },
                // { ip: '172.17.0.1', announcedIp: undefined },
                // { ip: '127.0.0.1', announcedIp: '192.168.1.34' },
                // { ip: "192.168.42.68", announcedIp: null },
                // { ip: '10.10.23.101', announcedIp: null },
            ] as TransportListenIp[],
            initialAvailableOutgoingBitrate: 800000,
        },
    },
};
