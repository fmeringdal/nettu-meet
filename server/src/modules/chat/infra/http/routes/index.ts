import express from 'express';
import { getChatController } from '../../../useCases/getChat';

const chatRouter = express.Router();

chatRouter.get('/:meetingId/:chatId', (req, res) => getChatController.execute(req, res));

export { chatRouter };
