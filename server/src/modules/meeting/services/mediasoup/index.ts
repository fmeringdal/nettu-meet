import { Socket } from 'socket.io';
import { rooms } from './rooms';
import { closePeer } from './server';
export { signalingRouter } from './server';

export const onPeerJoinedMeeting = async (socket: Socket, meetingId: string) => {
    socket.on('disconnect', async () => {
        const room = rooms.get(meetingId);
        if (room) {
            closePeer(socket.id, room);
        }
    });
};
