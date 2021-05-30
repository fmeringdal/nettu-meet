import Joi from 'joi';
import { Account } from '../../../account/domain/account';
import { OpeningTime } from '../../domain/meeting';

export interface UpdateMeetingDTO extends BodySchema, PathParamsSchema {
    account: Account;
}

export interface BodySchema {
    title?: string;
    redirectURI?: string;
    openingTime?: OpeningTime;
}

export interface PathParamsSchema {
    meetingId: string;
}

const openingTimeSchema = Joi.object({
    startTS: Joi.number(),
    endTS: Joi.number(),
}).optional();

export const bodySchema = Joi.object({
    title: Joi.string().optional(),
    redirectURI: Joi.string().optional(),
    openingTime: openingTimeSchema,
});

export const pathParamsSchema = Joi.object({
    meetingId: Joi.string().uuid(),
});
