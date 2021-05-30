import { emailService } from '../../../../shared/services';
import { emailTokenVerificationRepoRepo } from '../../repos';
import { CreateEmailVerificationController } from './CreateEmailVerificationCodeController';
import { CreateEmailVerificationCodeUseCase } from './CreateEmailVerificationCodeUseCase';

const createEmailVerificationCodeUseCase = new CreateEmailVerificationCodeUseCase(
    emailTokenVerificationRepoRepo,
    emailService,
);
const createEmailVerificationController = new CreateEmailVerificationController(createEmailVerificationCodeUseCase);

export { createEmailVerificationController };
