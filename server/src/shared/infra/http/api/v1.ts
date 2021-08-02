import express from 'express';
import { Socket } from 'socket.io';
import { docsRouter } from '../../../../docs/spec';
import { chatRouter } from '../../../../modules/chat/infra/http/routes';
import { accountRouter } from '../../../../modules/account/infra/http/routes';
import { meetingRouter, meetingSocketHandler } from '../../../../modules/meeting/infra/http/routes';
import { signalingRouter } from '../../../../modules/meeting/services/mediasoup';
import { userRouter } from '../../../../modules/user/infra/http/routes';
import { logger } from "../../../../logger"

const v1Router = express.Router();

v1Router.get('/', (req, res) => {
    return res.json({ message: 'Ofc, we are up!' });
});

v1Router.use('/account', accountRouter);
v1Router.use('/meeting', meetingRouter);
v1Router.use('/chat', chatRouter);
v1Router.use('/user', userRouter);
v1Router.use('/signaling', signalingRouter);
v1Router.use('/docs', docsRouter);

const v1SocketHandler = (socket: Socket) => {
    logger.info({socketId : socket.id},'user connected: ' + socket.id);

    meetingSocketHandler(socket);

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', socket.id);
    });
};

export { v1Router, v1SocketHandler };
