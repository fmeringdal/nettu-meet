import { Result } from '../../../../shared/core/Result';
import { UseCaseError } from '../../../../shared/core/UseCaseError';

export namespace ValidateEmailVerificationCodeErrors {
    export class InvalidEmailTokenError extends Result<UseCaseError> {
        constructor() {
            super(false, {
                message: `Provided email token is invalid.`,
            } as UseCaseError);
        }
    }
}
