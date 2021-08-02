import express from 'express';
import { Socket } from 'socket.io';
import { middleware } from '../../../../../shared/infra/http';
import { io } from '../../../../../shared/infra/http/app';
import { sendChatMessageController } from '../../../../chat/useCases/sendChatMessage';
import { onPeerJoinedMeeting } from '../../../services/mediasoup';
import { createCanvasController } from '../../../useCases/createCanvas';
import { createDemoMeetingController } from '../../../useCases/createDemoMeeting';
import { createMeetingController } from '../../../useCases/createMeeting';
import { createResourceController } from '../../../useCases/createResource';
import { deleteMeetingController } from '../../../useCases/deleteMeeting';
import { deleteResourceController } from '../../../useCases/deleteResource';
import { getCanvasController } from '../../../useCases/getCanvas';
import { getMeetingController } from '../../../useCases/getMeeting';
import { setActiveCanvasController } from '../../../useCases/setActiveCanvas';
import { setCanvasDataController } from '../../../useCases/setCanvasData';
import { updateMeetingController } from '../../../useCases/updateMeeting';
import {logger} from "../../../../../logger"

const meetingRouter = express.Router();

meetingRouter.post('/', middleware.ensureAccountAdmin(), (req, res) => createMeetingController.execute(req, res));

meetingRouter.post('/demo', (req, res) => createDemoMeetingController.execute(req, res));

meetingRouter.get('/:meetingId', (req, res) => getMeetingController.execute(req, res));

meetingRouter.put('/:meetingId', middleware.ensureAccountAdmin(), (req, res) =>
    updateMeetingController.execute(req, res),
);

meetingRouter.delete('/:meetingId', middleware.ensureAccountAdmin(), (req, res) =>
    deleteMeetingController.execute(req, res),
);

meetingRouter.post('/:meetingId/canvas', (req, res) => createCanvasController.execute(req, res));

meetingRouter.post('/:meetingId/resource', (req, res) => createResourceController.execute(req, res));

meetingRouter.delete('/:meetingId/resource/:resourceId', (req, res) => deleteResourceController.execute(req, res));

meetingRouter.get('/canvas/:canvasId', (req, res) => getCanvasController.execute(req, res));

const meetingSocketHandler = (socket: Socket) => {
    socket.on('join-room', async (meetingId) => {
        logger.info({socketId : socket.id, meetingId : meetingId}, 'socket: ' + socket.id + ', joined room: ' + meetingId);

        socket.join(meetingId);
        socket.broadcast.to(meetingId).emit('user-connected', socket.id);

        onPeerJoinedMeeting(socket, meetingId);

        socket.on('canvas-update', (canvasId, event) => {
            setCanvasDataController.executeImpl(socket, {
                canvasId,
                meetingId,
                event,
            });
        });

        socket.on('active-canvas-change', (canvasId) => {
            setActiveCanvasController.executeImpl(socket, {
                canvasId,
                meetingId,
            });
        });

        socket.on('chat-message', (chatId, event) => {
            sendChatMessageController.executeImpl(socket, {
                meetingId,
                chatId,
                content: event.content,
            });
        });

        socket.on('new-resource', (data) => {
            io.to(meetingId).emit('new-resource', data);
        });
    });
};

export { meetingRouter, meetingSocketHandler };
