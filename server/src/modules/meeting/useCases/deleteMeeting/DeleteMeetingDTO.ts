import Joi from 'joi';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { Account } from '../../../account/domain/account';

export interface DeleteMeetingDTO extends PathParamsSchema {
    account: Account;
}

export interface PathParamsSchema {
    meetingId: string;
}

export const pathParamsSchema = Joi.object({
    meetingId: Joi.string().uuid(),
});
