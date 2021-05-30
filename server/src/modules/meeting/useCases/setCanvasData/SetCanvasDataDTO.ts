import Joi from 'joi';

export interface SetCanvasDataDTO {
    meetingId: string;
    canvasId: string;
    canvasJSON: string;
}

export interface CanvasUpdateEvent {
    action: string;
    actionData: string;
    canvasJSON: string;
}

export interface PayloadSchema {
    meetingId: string;
    canvasId: string;
    event: CanvasUpdateEvent;
}

const payloadEventSchema = Joi.object({
    action: Joi.string(),
    actionData: Joi.string(),
    canvasJSON: Joi.string(),
});

export const payloadSchema = Joi.object({
    meetingId: Joi.string().uuid(),
    canvasId: Joi.string().uuid(),
    event: payloadEventSchema,
});
