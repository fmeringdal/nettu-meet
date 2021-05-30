import { chatRepo } from '../../repos';
import { SendChatMessageController } from './SendChatMessageController';
import { SendChatMessageUseCase } from './SendChatMessageUseCase';

const sendChatMessageUseCase = new SendChatMessageUseCase(chatRepo);
const sendChatMessageController = new SendChatMessageController(sendChatMessageUseCase);

export { sendChatMessageController };
