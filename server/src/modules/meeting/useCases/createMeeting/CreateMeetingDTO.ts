import Joi from 'joi';
import { Account } from '../../../account/domain/account';
import { OpeningTime } from '../../domain/meeting';

export interface CreateMeetingDTO {
    title: string;
    redirectURI?: string;
    openingTime?: OpeningTime;
    account: Account;
}

export interface RequestBodySchema {
    title: string;
    redirectURI?: string;
    openingTime?: OpeningTime;
}

const openingTimeSchema = Joi.object({
    startTS: Joi.number(),
    endTS: Joi.number(),
}).optional();

export const requestBodySchema = Joi.object({
    title: Joi.string(),
    redirectURI: Joi.string().optional(),
    openingTime: openingTimeSchema,
});

interface MeetingEntrypoint {
    url: string;
}

export interface CreateMeetingResponseDTO {
    meetingId: string;
    entrypoints: MeetingEntrypoint[];
}
