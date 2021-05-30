import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace SendChatMessageUseCaseErrors {
    export class ChatNotFoundError extends Result<UseCaseError> {
        constructor(id: string) {
            super(false, {
                message: `Chat with id: ${id}, does not exist.`,
            } as UseCaseError);
        }
    }
}
