import Joi from 'joi';
import { Account } from '../../domain/account';

export interface UpdateAccountDTO extends UpdateAccountBodySchema {
    account: Account;
}

export interface UpdateAccountBodySchema {
    name?: string;
    label?: string;
    iconURL?: string;
    redirectURIs?: string[];
    defaultRedirectURI?: string;
}

export const updateAccountBodySchema = Joi.object({
    name: Joi.string().optional(),
    label: Joi.string().optional(),
    iconURL: Joi.string().optional(),
    redirectURIs: Joi.array().items(Joi.string()).optional(),
    redirectURI: Joi.string().optional(),
});
