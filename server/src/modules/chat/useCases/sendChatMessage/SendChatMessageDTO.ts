import Joi from 'joi';
import { ChatMessageSender, ChatMessageVariant } from '../../domain/chat';

export interface SendChatMessageDTO extends PayloadSchema {
    variant: ChatMessageVariant;
    sender: ChatMessageSender;
}

export interface PayloadSchema {
    meetingId: string;
    chatId: string;
    content: string;
}

export const payloadSchema = Joi.object({
    meetingId: Joi.string().uuid(),
    chatId: Joi.string().uuid(),
    content: Joi.string(),
});
