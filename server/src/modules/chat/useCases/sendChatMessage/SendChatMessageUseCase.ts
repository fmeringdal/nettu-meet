import { AppError } from '../../../../shared/core/AppError';
import { Either, left, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { ChatMessage } from '../../domain/chat';
import { IChatRepo } from '../../repos/chatRepo';
import { SendChatMessageDTO } from './SendChatMessageDTO';
import { SendChatMessageUseCaseErrors } from './SendChatMessageErrors';

type Response = Either<SendChatMessageUseCaseErrors.ChatNotFoundError | AppError.UnexpectedError, ChatMessage>;

export class SendChatMessageUseCase implements UseCase<SendChatMessageDTO, Promise<Response>> {
    private chatRepo: IChatRepo;

    constructor(chatRepo: IChatRepo) {
        this.chatRepo = chatRepo;
    }

    public async execute(request: SendChatMessageDTO): Promise<Response> {
        try {
            const message: ChatMessage = {
                content: request.content,
                variant: request.variant,
                createdAt: new Date(),
                id: new UniqueEntityID(),
                sender: request.sender,
            };
            await this.chatRepo.insertMessage(request.chatId, message);
            return right(message);
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
