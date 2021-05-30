import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';
import { CanvasDTO } from '../../dtos/canvasDTO';
import { CanvasMap } from '../../mappers/canvasMap';
import { pathParamsSchema, PathParamsSchema } from './GetCanvasDTO';
import { GetCanvasUseCaseErrors } from './GetCanvasErrors';
import { GetCanvasUseCase } from './GetCanvasUseCase';

export class GetCanvasController extends BaseController<{}, PathParamsSchema> {
    private useCase: GetCanvasUseCase;

    constructor(useCase: GetCanvasUseCase) {
        super(null, pathParamsSchema);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest<{}, PathParamsSchema>, res: NettuAppResponse): Promise<void> {
        const dto = req.pathParams;

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();

                switch (error.constructor) {
                    case GetCanvasUseCaseErrors.CanvasNotFoundError:
                        return res.notFound(e.message);
                    default:
                        return res.fail();
                }
            } else {
                const dto: CanvasDTO = CanvasMap.toDTO(result.value);
                return res.ok<CanvasDTO>(dto);
            }
        } catch (err) {
            return res.fail();
        }
    }
}
