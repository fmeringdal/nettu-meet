import { User } from '../../user/domain/user';

export type MeetingParticipantRole = 'tutor' | 'student';

export interface MeetingParticipant {
    user: User;
    role: MeetingParticipantRole;
}
