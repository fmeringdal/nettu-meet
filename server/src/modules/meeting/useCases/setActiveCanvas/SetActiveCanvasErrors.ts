import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace SetActiveCanvasUseCaseErrors {
    export class CanvasNotFoundError extends Result<UseCaseError> {
        constructor(canvasId: string) {
            super(false, {
                message: `Canvas with id: ${canvasId}, does not exist`,
            } as UseCaseError);
        }
    }
}
