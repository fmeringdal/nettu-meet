import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace UpdateAccountUseCaseErrors {
    export class AccountNameAlreadyInUseError extends Result<UseCaseError> {
        constructor(name: string) {
            super(false, {
                message: `Account names need to be unique and the name: ${name}, is already in use.`,
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
