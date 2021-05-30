import Joi from 'joi';
import { ResourceDTO } from '../../dtos/resourceDTO';

export interface BodySchema {
    contentType: string;
    name: string;
    canvasId?: string;
}

export interface PathParamsSchema {
    meetingId: string;
}

export interface CreateResourceDTO extends BodySchema, PathParamsSchema {}

export interface CreateResourceResponseDTO {
    signedUploadURL: string;
    resource: ResourceDTO;
}

export const bodySchema = Joi.object({
    name: Joi.string(),
    contentType: Joi.string(),
    canvasId: Joi.string().uuid().optional(),
});

export const pathParamsSchema = Joi.object({
    meetingId: Joi.string().uuid(),
});
