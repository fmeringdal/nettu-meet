import { chatRepo } from '../../repos';
import { GetChatController } from './GetChatController';
import { GetChatUseCase } from './GetChatUseCase';

const getChatUseCase = new GetChatUseCase(chatRepo);
const getChatController = new GetChatController(getChatUseCase);

export { getChatController };
