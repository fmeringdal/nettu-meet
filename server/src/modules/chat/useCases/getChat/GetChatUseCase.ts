import { AppError } from '../../../../shared/core/AppError';
import { Either, left, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { Chat } from '../../domain/chat';
import { IChatRepo } from '../../repos/chatRepo';
import { GetChatDTO } from './GetChatDTO';
import { GetChatUseCaseErrors } from './GetChatErrors';

type Response = Either<GetChatUseCaseErrors.ChatNotFoundError | AppError.UnexpectedError, Chat>;

export class GetChatUseCase implements UseCase<GetChatDTO, Promise<Response>> {
    private chatRepo: IChatRepo;

    constructor(chatRepo: IChatRepo) {
        this.chatRepo = chatRepo;
    }

    public async execute(request: GetChatDTO): Promise<Response> {
        let chat: Chat | undefined;

        try {
            chat = await this.chatRepo.getChatByChatId(request.chatId);

            if (!chat || chat.meetingId.toString() !== request.meetingId) {
                return left(new GetChatUseCaseErrors.ChatNotFoundError(request.chatId as string));
            }

            return right(chat);
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
