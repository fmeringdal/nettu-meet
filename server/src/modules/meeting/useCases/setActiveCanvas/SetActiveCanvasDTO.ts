import Joi from 'joi';

export interface SetActiveCanvasDTO {
    meetingId: string;
    canvasId: string;
}

export const payloadSchema = Joi.object({
    meetingId: Joi.string().uuid(),
    canvasId: Joi.string().uuid(),
});
