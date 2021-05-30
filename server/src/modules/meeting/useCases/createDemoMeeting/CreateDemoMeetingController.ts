import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';
import { CreateMeetingResponseDTO } from '../createMeeting/CreateMeetingDTO';
import { CreateDemoMeetingUseCase } from './CreateDemoMeetingUseCase';

export class CreateDemoMeetingController extends BaseController {
    private useCase: CreateDemoMeetingUseCase;

    constructor(useCase: CreateDemoMeetingUseCase) {
        super(null, null);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest, res: NettuAppResponse): Promise<void> {
        try {
            const result = await this.useCase.execute({});

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();

                switch (error.constructor) {
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
