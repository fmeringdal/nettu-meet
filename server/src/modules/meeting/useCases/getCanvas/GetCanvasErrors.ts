import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace GetCanvasUseCaseErrors {
    export class CanvasNotFoundError extends Result<UseCaseError> {
        constructor(canvasId: string) {
            super(false, {
                message: `Canvas with id: ${canvasId}, was not found.`,
            } as UseCaseError);
        }
    }
}
