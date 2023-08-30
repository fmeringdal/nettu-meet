import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';
import { bodySchema, CreateEmailVerificationCodeDTO } from './CreateEmailVerificationCodeDTO';
import { CreateEmailVerificationCodeErrors } from './CreateEmailVerificationCodeErrors';
import { CreateEmailVerificationCodeUseCase } from './CreateEmailVerificationCodeUseCase';
import {logger} from "../../../../logger"

export class CreateEmailVerificationController extends BaseController {
    private useCase: CreateEmailVerificationCodeUseCase;

    constructor(useCase: CreateEmailVerificationCodeUseCase) {
        super(bodySchema, null);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest<CreateEmailVerificationCodeDTO>, res: NettuAppResponse): Promise<void> {
        const dto = req.body;

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();
                switch (error.constructor) {
                    case CreateEmailVerificationCodeErrors.InvalidEmailError:
                        return res.forbidden(e.message);
                    case CreateEmailVerificationCodeErrors.EmailBlacklistedError:
                        return res.forbidden(e.message);
                    default:
                        return res.fail();
                }
            } else {
                return res.created({});
            }
        } catch (err) {
            logger.error({error : err}, "error", err);
            return res.fail();
        }
    }
}
