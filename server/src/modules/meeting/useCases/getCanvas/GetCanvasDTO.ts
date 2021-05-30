import Joi from 'joi';

export interface GetCanvasDTO extends PathParamsSchema {}

export interface PathParamsSchema {
    canvasId: string;
}

export const pathParamsSchema = Joi.object({
    canvasId: Joi.string().uuid(),
});
