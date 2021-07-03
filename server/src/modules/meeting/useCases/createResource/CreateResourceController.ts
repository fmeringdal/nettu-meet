import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';
import {
    bodySchema,
    BodySchema,
    CreateResourceDTO,
    CreateResourceResponseDTO,
    pathParamsSchema,
    PathParamsSchema,
} from './CreateResourceDTO';
import { CreateResourceUseCaseErrors } from './CreateResourceErrors';
import { CreateResourceUseCase } from './CreateResourceUseCase';

export class CreateResourceController extends BaseController<BodySchema, PathParamsSchema> {
    private useCase: CreateResourceUseCase;

    constructor(useCase: CreateResourceUseCase) {
        super(bodySchema, pathParamsSchema);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest<BodySchema, PathParamsSchema>, res: NettuAppResponse): Promise<void> {
        const dto: CreateResourceDTO = {
            ...req.body,
            ...req.pathParams,
        };

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();

                switch (error.constructor) {
                    case CreateResourceUseCaseErrors.ResourceLimitReachedError:
                        return res.forbidden(e.message);
                    case CreateResourceUseCaseErrors.MeetingNotFoundError:
                        return res.notFound(e.message);
                    case CreateResourceUseCaseErrors.ResourceUploadNotSupportedError:
                        return res.forbidden(e.message);
                    case CreateResourceUseCaseErrors.CanvasNotFoundError:
                        return res.notFound(e.message);
                    default:
                        return res.fail();
                }
            } else {
                return res.created<CreateResourceResponseDTO>({
                    signedUploadURL: result.value.signedUploadURL,
                    resource: result.value.resource,
                });
            }
        } catch (err) {
            return res.fail();
        }
    }
}
