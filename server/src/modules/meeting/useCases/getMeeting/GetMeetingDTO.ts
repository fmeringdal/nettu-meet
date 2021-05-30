import Joi from 'joi';
import { AccountDTO } from '../../../account/dtos/accountDTO';
import { MeetingDTO } from '../../dtos/meetingDTO';

export interface GetMeetingDTO {
    meetingId: string;
}

export const getMeetingPathSchema = Joi.object({
    meetingId: Joi.string().uuid(),
}).optional();

export interface GetMeetingResponseDTO {
    meeting: MeetingDTO;
    account: AccountDTO;
}
