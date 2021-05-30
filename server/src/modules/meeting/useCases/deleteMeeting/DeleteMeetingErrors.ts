import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace DeleteMeetingUseCaseErrors {
    export class MeetingNotFoundError extends Result<UseCaseError> {
        constructor(meetingId: string) {
            super(false, {
                message: `Meeting with id: ${meetingId}, does not exist.`,
            } as UseCaseError);
        }
    }
}
