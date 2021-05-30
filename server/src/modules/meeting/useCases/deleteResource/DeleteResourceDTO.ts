import Joi from 'joi';

export interface DeleteResourceDTO extends PathParamsSchema {
    meetingId: string;
    resourceId: string;
}

export interface PathParamsSchema {
    meetingId: string;
    resourceId: string;
}

export const pathParamsSchema = Joi.object({
    meetingId: Joi.string().uuid(),
    resourceId: Joi.string().uuid(),
});
