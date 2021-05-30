import { CreateMeetingUseCase } from './CreateMeetingUseCase';
import { requestBodySchema, CreateMeetingDTO, CreateMeetingResponseDTO, RequestBodySchema } from './CreateMeetingDTO';
import { CreateMeetingUseCaseErrors } from './CreateMeetingErrors';
import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';

export class CreateMeetingController extends BaseController<RequestBodySchema> {
    private useCase: CreateMeetingUseCase;

    constructor(useCase: CreateMeetingUseCase) {
        super(requestBodySchema, null);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest<RequestBodySchema>, res: NettuAppResponse): Promise<void> {
        const dto: CreateMeetingDTO = {
            title: req.body.title,
            redirectURI: req.body.redirectURI,
            openingTime: req.body.openingTime,
            account: req.account!,
        };

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();

                switch (error.constructor) {
                    case CreateMeetingUseCaseErrors.InvalidPropertyError:
                        return res.forbidden(e.message);
                    default:
                        return res.fail();
                }
            } else {
                const dto: CreateMeetingResponseDTO = result.value;
                return res.created<CreateMeetingResponseDTO>(dto);
            }
        } catch (err) {
            return res.fail();
        }
    }
}
