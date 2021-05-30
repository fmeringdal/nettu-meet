import Joi from 'joi';
import { join } from 'path';

export interface CreateDefaultAccountDTO {
    name: string;
    label: string;
    secretKey: string;
    iconURL?: string;
    redirectURIs?: string[];
    redirectURI: string;
}

export const createDefaultAccountBodySchema = Joi.object({
    name: Joi.string(),
    label: Joi.string(),
    secretKey: Joi.string(),
    iconURL: Joi.string().optional(),
    redirectURIs: Joi.array().items(Joi.string()).optional(),
    redirectURI: Joi.string(),
});
