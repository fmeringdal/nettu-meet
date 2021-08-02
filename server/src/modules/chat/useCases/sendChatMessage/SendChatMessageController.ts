import { Socket } from 'socket.io';
import { io } from '../../../../shared/infra/http/app';
import { BaseWSController } from '../../../../shared/infra/http/models/BaseWSController';
import { ChatMessageMap } from '../../mappers/chatMessageMap';
import { PayloadSchema, payloadSchema, SendChatMessageDTO } from './SendChatMessageDTO';
import { SendChatMessageUseCase } from './SendChatMessageUseCase';
import { logger } from "../../../../logger"

export class SendChatMessageController extends BaseWSController {
    private useCase: SendChatMessageUseCase;

    constructor(useCase: SendChatMessageUseCase) {
        super(payloadSchema);
        this.useCase = useCase;
    }

    async executeImpl(socket: Socket, req: PayloadSchema): Promise<void> {
        const dto: SendChatMessageDTO = {
            meetingId: req.meetingId,
            chatId: req.chatId,
            content: req.content,
            variant: 'general',
            sender: {
                entity: 'socket',
                id: socket.id,
            },
        };

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                logger.error({error : error}, "error");
                // switch (error.constructor) {
                //   case SendChatMessageUseCaseErrors.ChatNotFoundError:
                //     return this.notFound(res, error.errorValue().message);
                //   default:
                //     const e = error.errorValue();
                //     return this.fail(res, typeof e === "string" ? e : e.message);
                // }
            } else {
                io.to(dto.meetingId).emit('chat-message', {
                    meetingId: dto.meetingId,
                    chatId: dto.chatId,
                    message: ChatMessageMap.toDTO(result.value),
                });
            }
        } catch (err) {
            logger.error({error : err});
            //   return this.fail(res, err);
        }
    }
}
