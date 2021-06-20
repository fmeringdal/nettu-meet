import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace CreateResourceUseCaseErrors {
    export class MeetingNotFoundError extends Result<UseCaseError> {
        constructor(meetingId: string) {
            super(false, {
                message: `Meeting with id: ${meetingId}, was not found.`,
            } as UseCaseError);
        }
    }

    export class CanvasNotFoundError extends Result<UseCaseError> {
        constructor(meetingId: string, canvasId: string) {
            super(false, {
                message: `Meeting with id: ${meetingId}, does not have a canvas with id: ${canvasId}.`,
            } as UseCaseError);
        }
    }

    export class ResourceLimitReachedError extends Result<UseCaseError> {
        constructor(meetingId: string, limit: number) {
            super(false, {
                message: `Unable to create a new resource because the meeting: ${meetingId} has reached the maximum amount of ${limit} resources`,
            } as UseCaseError);
        }
    }

    export class ResourceUploadNotSupportedError extends Result<UseCaseError> {
        constructor() {
            super(false, {
                message: `Resource upload is not supported on this server.`,
            } as UseCaseError);
        }
    }
}
