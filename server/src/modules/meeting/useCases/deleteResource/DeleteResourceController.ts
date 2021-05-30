import * as express from 'express';
import { io } from '../../../../shared/infra/http/app';
import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';
import { DeleteResourceDTO, PathParamsSchema, pathParamsSchema } from './DeleteResourceDTO';
import { DeleteResourceUseCaseErrors } from './DeleteResourceErrors';
import { DeleteResourceUseCase } from './DeleteResourceUseCase';

export class DeleteResourceController extends BaseController<{}, PathParamsSchema> {
    private useCase: DeleteResourceUseCase;

    constructor(useCase: DeleteResourceUseCase) {
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
                    case DeleteResourceUseCaseErrors.MeetingNotFoundError:
                        return res.notFound(e.message);
                    case DeleteResourceUseCaseErrors.ResourceNotFoundError:
                        return res.notFound(e.message);
                    default:
                        return res.fail();
                }
            } else {
                io.to(dto.meetingId).emit('deleted-resource', dto.resourceId);
                return res.ok({});
            }
        } catch (err) {
            return res.fail();
        }
    }
}
