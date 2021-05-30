import { CreateAccountUseCase } from './CreateAccountUseCase';
import { createAccountBodyRequest, CreateAccountDTO, CreateAccountResponseDTO } from './CreateAccountDTO';
import { CreateAccountUseCaseErrors } from './CreateAccountErrors';
import { BaseController, NettuAppRequest, NettuAppResponse } from '../../../../shared/infra/http/models/BaseController';

export class CreateAccountController extends BaseController {
    private useCase: CreateAccountUseCase;

    constructor(useCase: CreateAccountUseCase) {
        super(createAccountBodyRequest, null);
        this.useCase = useCase;
    }

    async executeImpl(req: NettuAppRequest<CreateAccountDTO>, res: NettuAppResponse): Promise<void> {
        const dto = req.body;

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                const error = result.value;
                const e = error.errorValue();

                switch (error.constructor) {
                    case CreateAccountUseCaseErrors.AccountNameAlreadyInUseError:
                        return res.conflict(e.message);
                    case CreateAccountUseCaseErrors.InvalidPropertyError:
                        return res.forbidden(e.message);
                    case CreateAccountUseCaseErrors.InvalidEmailTokenError:
                        return res.forbidden(e.message);
                    default:
                        return res.fail();
                }
            } else {
                const dto: CreateAccountResponseDTO = result.value;
                return res.created<CreateAccountResponseDTO>(dto);
            }
        } catch (err) {
            return res.fail();
        }
    }
}
