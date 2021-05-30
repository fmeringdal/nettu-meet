import { accountRepo } from '../../repos';
import { UpdateAccountController } from './UpdateAccountController';
import { UpdateAccountUseCase } from './UpdateAccountUseCase';

const updateAccountUseCase = new UpdateAccountUseCase(accountRepo);
const updateAccountController = new UpdateAccountController(updateAccountUseCase);

export { updateAccountController };
