import { Result } from '../../../../shared/core/Result';
import { UseCaseError } from '../../../../shared/core/UseCaseError';

export namespace CreateEmailVerificationCodeErrors {
    export class InvalidEmailError extends Result<UseCaseError> {
        constructor(email: string) {
            super(false, {
                message: `Email: ${email} is not a valid email.`,
            } as UseCaseError);
        }
    }

    export class EmailBlacklistedError extends Result<UseCaseError> {
        constructor(email: string) {
            super(false, {
                message: `Email: ${email} have too many invalid verification attempts.`,
            } as UseCaseError);
        }
    }
}
