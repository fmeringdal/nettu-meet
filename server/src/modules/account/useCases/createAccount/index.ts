import { emailTokenVerificationRepoRepo } from '../../../user/repos';
import { validateEmailVerificationCodeUseCase } from '../../../user/useCases/validateEmailVerificationCode';
import { accountRepo } from '../../repos';
import { CreateAccountController } from './CreateAccountController';
import { CreateAccountUseCase } from './CreateAccountUseCase';

const createAccountUseCase = new CreateAccountUseCase(
    validateEmailVerificationCodeUseCase,
    accountRepo,
    emailTokenVerificationRepoRepo,
);
const createAccountController = new CreateAccountController(createAccountUseCase);

export { createAccountController };
