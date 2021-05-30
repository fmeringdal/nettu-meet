import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace GetChatUseCaseErrors {
    export class ChatNotFoundError extends Result<UseCaseError> {
        constructor(chatId: string) {
            super(false, {
                message: `Chat with id: ${chatId}, was not found.`,
            } as UseCaseError);
        }
    }
}
