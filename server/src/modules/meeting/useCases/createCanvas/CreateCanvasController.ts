import { io } from '../../../../shared/infra/http/app';
import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';
import { pathParamsSchema, CreateCanvasDTO, CreateCanvasResponseDTO } from './CreateCanvasDTO';
import { CreateCanvasUseCaseErrors } from './CreateCanvasErrors';
import { CreateCanvasUseCase } from './CreateCanvasUseCase';

export class CreateCanvasController extends BaseController {
    private useCase: CreateCanvasUseCase;

    constructor(useCase: CreateCanvasUseCase) {
        super(null, pathParamsSchema);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest<{}, CreateCanvasDTO>, res: NettuAppResponse): Promise<void> {
        const dto = req.pathParams;

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();

                switch (error.constructor) {
                    case CreateCanvasUseCaseErrors.CanvasLimitReachedError:
                        return res.forbidden(e.message);
                    case CreateCanvasUseCaseErrors.MeetingNotFoundError:
                        return res.notFound(e.message);
                    default:
                        return res.fail();
                }
            } else {
                const canvasId = result.value.toString();
                io.to(dto.meetingId).emit('new-canvas', {
                    canvasId,
                    meetingId: dto.meetingId,
                });
                return res.created<CreateCanvasResponseDTO>({
                    canvasId,
                    meetingId: dto.meetingId,
                });
            }
        } catch (err) {
            return res.fail();
        }
    }
}
