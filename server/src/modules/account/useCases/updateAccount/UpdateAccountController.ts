import { UpdateAccountUseCase } from './UpdateAccountUseCase';
import { UpdateAccountBodySchema, updateAccountBodySchema, UpdateAccountDTO } from './UpdateAccountDTO';
import { UpdateAccountUseCaseErrors } from './UpdateAccountErrors';
import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';

export class UpdateAccountController extends BaseController {
    private useCase: UpdateAccountUseCase;

    constructor(useCase: UpdateAccountUseCase) {
        super(updateAccountBodySchema, null);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest<UpdateAccountBodySchema>, res: NettuAppResponse): Promise<void> {
        const dto: UpdateAccountDTO = {
            ...req.body,
            account: req.account!,
        };

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();

                switch (error.constructor) {
                    case UpdateAccountUseCaseErrors.AccountNameAlreadyInUseError:
                        return res.conflict(e.message);
                    case UpdateAccountUseCaseErrors.InvalidPropertyError:
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
