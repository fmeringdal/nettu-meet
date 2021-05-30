import Joi from 'joi';

export interface CreateAccountDTO {
    emailToken: {
        email: string;
        code: string;
    };
    name: string;
    label: string;
    redirectURIs: string[];
    defaultRedirectURI: string;
}

export interface CreateAccountResponseDTO {
    secretKey: string;
}

const emailToken = Joi.object({
    email: Joi.string().email(),
    code: Joi.string(),
});

export const createAccountBodyRequest: Joi.ObjectSchema<CreateAccountDTO> = Joi.object({
    emailToken: emailToken,
    name: Joi.string(),
    label: Joi.string(),
    redirectURIs: Joi.array().items(Joi.string()),
    defaultRedirectURI: Joi.string(),
});
