import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace CreateDefaultAccountUseCaseErrors {
    export class InvalidPropertyError extends Result<UseCaseError> {
        constructor(msg: string) {
            super(false, {
                message: `Invalid account property error: ${msg}`,
            } as UseCaseError);
        }
    }
}
