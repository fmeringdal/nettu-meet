import { accountRepo } from '../../repos';
import { CreateDefaultAccountController } from './CreateDefaultAccountController';
import { CreateDefaultAccountUseCase } from './CreateDefaultAccountUseCase';

const createDefaultAccountUseCase = new CreateDefaultAccountUseCase(accountRepo);
const createDefaultAccountController = new CreateDefaultAccountController(createDefaultAccountUseCase);

export { createDefaultAccountController };
