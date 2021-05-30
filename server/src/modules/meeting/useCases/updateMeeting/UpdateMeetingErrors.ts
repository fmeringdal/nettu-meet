import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace UpdateMeetingUseCaseErrors {
    export class MeetingNotFoundError extends Result<UseCaseError> {
        constructor(meetingId: string) {
            super(false, {
                message: `Meeting with id: ${meetingId}, does not exist.`,
            } as UseCaseError);
        }
    }

    export class InvalidPropertyError extends Result<UseCaseError> {
        constructor(errorMsg: string) {
            super(false, {
                message: `Invalid account property error: ${errorMsg}`,
            } as UseCaseError);
        }
    }
}
