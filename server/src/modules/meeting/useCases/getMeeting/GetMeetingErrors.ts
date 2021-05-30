import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace GetMeetingUseCaseErrors {
    export class MeetingNotFoundError extends Result<UseCaseError> {
        constructor(meetingId: string) {
            super(false, {
                message: `Meeting with id: ${meetingId}, was not found.`,
            } as UseCaseError);
        }
    }
}
