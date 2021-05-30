import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace CreateAccountUseCaseErrors {
    export class AccountNameAlreadyInUseError extends Result<UseCaseError> {
        constructor(name: string) {
            super(false, {
                message: `Account names need to be unique and the name: ${name}, is already in use.`,
            } as UseCaseError);
        }
    }

    export class InvalidPropertyError extends Result<UseCaseError> {
        constructor(msg: string) {
            super(false, {
                message: `Invalid account property error: ${msg}`,
            } as UseCaseError);
        }
    }

    export class InvalidEmailTokenError extends Result<UseCaseError> {
        constructor() {
            super(false, {
                message: `Provided email token is invalid.`,
            } as UseCaseError);
        }
    }
}
