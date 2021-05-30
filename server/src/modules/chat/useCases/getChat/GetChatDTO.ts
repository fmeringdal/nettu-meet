import Joi from 'joi';

export interface GetChatDTO {
    chatId: string;
    meetingId: string;
}

export const getChatPathParamsSchema = Joi.object({
    chatId: Joi.string().uuid(),
    meetingId: Joi.string().uuid(),
});
