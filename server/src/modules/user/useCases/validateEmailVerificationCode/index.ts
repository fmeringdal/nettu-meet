import { emailTokenVerificationRepoRepo } from '../../repos';
import { ValidateEmailVerificationController } from './ValidateEmailVerificationCodeController';
import { ValidateEmailVerificationCodeUseCase } from './ValidateEmailVerificationCodeUseCase';

const validateEmailVerificationCodeUseCase = new ValidateEmailVerificationCodeUseCase(emailTokenVerificationRepoRepo);
const validateEmailVerificationController = new ValidateEmailVerificationController(
    validateEmailVerificationCodeUseCase,
);

export { validateEmailVerificationCodeUseCase, validateEmailVerificationController };
