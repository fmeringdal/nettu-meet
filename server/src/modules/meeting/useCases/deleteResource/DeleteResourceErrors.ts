import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace DeleteResourceUseCaseErrors {
    export class MeetingNotFoundError extends Result<UseCaseError> {
        constructor(meetingId: string) {
            super(false, {
                message: `Meeting with id: ${meetingId}, was not found.`,
            } as UseCaseError);
        }
    }

    export class ResourceNotFoundError extends Result<UseCaseError> {
        constructor(meetingId: string, resourceId: string) {
            super(false, {
                message: `Meeting with id: ${meetingId}, does not have a resource with id: ${resourceId}.`,
            } as UseCaseError);
        }
    }
}
