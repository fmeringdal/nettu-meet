import Joi from 'joi';

export interface CreateCanvasDTO {
    meetingId: string;
}

export interface CreateCanvasResponseDTO {
    meetingId: string;
    canvasId: string;
}

export const pathParamsSchema = Joi.object({
    meetingId: Joi.string().uuid(),
});
