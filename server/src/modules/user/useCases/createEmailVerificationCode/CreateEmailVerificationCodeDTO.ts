import Joi from 'joi';

export interface CreateEmailVerificationCodeDTO {
    email: string;
}

export const bodySchema = Joi.object({
    email: Joi.string().email(),
});
