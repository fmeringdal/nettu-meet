import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace CreateCanvasUseCaseErrors {
    export class MeetingNotFoundError extends Result<UseCaseError> {
        constructor(meetingId: string) {
            super(false, {
                message: `Meeting with id: ${meetingId}, was not found.`,
            } as UseCaseError);
        }
    }

    export class CanvasLimitReachedError extends Result<UseCaseError> {
        constructor(meetingId: string, limit: number) {
            super(false, {
                message: `Unable to create a new canvas because the meeting: ${meetingId} has reached the maximum amount of ${limit} canvases`,
            } as UseCaseError);
        }
    }
}
