import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';
import { DeleteMeetingDTO, pathParamsSchema, PathParamsSchema } from './DeleteMeetingDTO';
import { DeleteMeetingUseCaseErrors } from './DeleteMeetingErrors';
import { DeleteMeetingUseCase } from './DeleteMeetingUseCase';

export class DeleteMeetingController extends BaseController<{}, PathParamsSchema> {
    private useCase: DeleteMeetingUseCase;

    constructor(useCase: DeleteMeetingUseCase) {
        super(null, pathParamsSchema);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest<{}, PathParamsSchema>, res: NettuAppResponse): Promise<void> {
        const dto: DeleteMeetingDTO = {
            meetingId: req.pathParams.meetingId,
            account: req.account!,
        };
        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();

                switch (error.constructor) {
                    case DeleteMeetingUseCaseErrors.MeetingNotFoundError:
                        return res.notFound(e.message);
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
