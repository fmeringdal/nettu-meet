import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';
import { bodySchema, ValidateEmailVerificationCodeDTO } from './ValidateEmailVerificationCodeDTO';
import { ValidateEmailVerificationCodeErrors } from './ValidateEmailVerificationCodeErrors';
import { ValidateEmailVerificationCodeUseCase } from './ValidateEmailVerificationCodeUseCase';
import { logger } from "../../../../logger"

export class ValidateEmailVerificationController extends BaseController {
    private useCase: ValidateEmailVerificationCodeUseCase;

    constructor(useCase: ValidateEmailVerificationCodeUseCase) {
        super(bodySchema, null);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest<ValidateEmailVerificationCodeDTO>, res: NettuAppResponse): Promise<void> {
        const dto = req.body;

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();
                switch (error.constructor) {
                    case ValidateEmailVerificationCodeErrors.InvalidEmailTokenError:
                        return res.forbidden(e.message);
                    default:
                        return res.fail();
                }
            } else {
                return res.ok({});
            }
        } catch (err) {
            logger.error({error : err}, "error", err);
            return res.fail();
        }
    }
}
