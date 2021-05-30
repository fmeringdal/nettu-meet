import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace CreateMeetingUseCaseErrors {
    export class InvalidPropertyError extends Result<UseCaseError> {
        constructor(msg: string) {
            super(false, {
                message: `Invalid meeting property error: ${msg}`,
            } as UseCaseError);
        }
    }

    export class ForbiddenRedirectError extends Result<UseCaseError> {
        constructor(uri: string, allowed: string[]) {
            super(false, {
                message: `Invalid redirect uri for meeting: ${uri}. Allowerd redirect uris: ${allowed}`,
            } as UseCaseError);
        }
    }
}
