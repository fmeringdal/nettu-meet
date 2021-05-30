import Joi from 'joi';

export interface ValidateEmailVerificationCodeDTO {
    email: string;
    code: string;
}

export const bodySchema = Joi.object({
    email: Joi.string().email(),
    code: Joi.string(),
});
