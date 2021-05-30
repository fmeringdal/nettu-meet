import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';
import { ChatDTO } from '../../dtos/chatDTO';
import { ChatMap } from '../../mappers/chatMap';
import { GetChatDTO, getChatPathParamsSchema } from './GetChatDTO';
import { GetChatUseCaseErrors } from './GetChatErrors';
import { GetChatUseCase } from './GetChatUseCase';

export class GetChatController extends BaseController {
    private useCase: GetChatUseCase;

    constructor(useCase: GetChatUseCase) {
        super(null, getChatPathParamsSchema);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest<{}, GetChatDTO>, res: NettuAppResponse): Promise<void> {
        const dto = req.pathParams;

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();

                switch (error.constructor) {
                    case GetChatUseCaseErrors.ChatNotFoundError:
                        return res.notFound(e.message);
                    default:
                        return res.fail();
                }
            } else {
                const dto: ChatDTO = ChatMap.toDTO(result.value);
                return res.ok<{ chat: ChatDTO }>({ chat: dto });
            }
        } catch (err) {
            return res.fail();
        }
    }
}
