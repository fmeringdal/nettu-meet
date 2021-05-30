import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';
import { GetMeetingDTO, getMeetingPathSchema } from './GetMeetingDTO';
import { GetMeetingUseCaseErrors } from './GetMeetingErrors';
import { GetMeetingUseCase } from './GetMeetingUseCase';

export class GetMeetingController extends BaseController {
    private useCase: GetMeetingUseCase;

    constructor(useCase: GetMeetingUseCase) {
        super(null, getMeetingPathSchema);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest<{}, GetMeetingDTO>, res: NettuAppResponse): Promise<void> {
        const dto: GetMeetingDTO = {
            meetingId: req.pathParams.meetingId,
        };

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();

                switch (error.constructor) {
                    case GetMeetingUseCaseErrors.MeetingNotFoundError:
                        return res.notFound(e.message);
                    default:
                        return res.fail();
                }
            } else {
                return res.ok(result.value);
            }
        } catch (err) {
            return res.fail();
        }
    }
}
