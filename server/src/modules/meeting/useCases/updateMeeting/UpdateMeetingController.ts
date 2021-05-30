import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';
import { bodySchema, BodySchema, pathParamsSchema, PathParamsSchema, UpdateMeetingDTO } from './UpdateMeetingDTO';
import { UpdateMeetingUseCaseErrors } from './UpdateMeetingErrors';
import { UpdateMeetingUseCase } from './UpdateMeetingUseCase';

export class UpdateMeetingController extends BaseController<BodySchema, PathParamsSchema> {
    private useCase: UpdateMeetingUseCase;

    constructor(useCase: UpdateMeetingUseCase) {
        super(bodySchema, pathParamsSchema);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest<BodySchema, PathParamsSchema>, res: NettuAppResponse): Promise<void> {
        const dto: UpdateMeetingDTO = {
            ...req.body,
            ...req.pathParams,
            account: req.account!,
        };

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();
                switch (error.constructor) {
                    case UpdateMeetingUseCaseErrors.MeetingNotFoundError:
                        return res.notFound(e.message);
                    case UpdateMeetingUseCaseErrors.InvalidPropertyError:
                        return res.forbidden(e.message);
                    default:
                        return res.fail();
                }
            } else {
                return res.ok({});
            }
        } catch (err) {
            return res.fail();
        }
    }
}
