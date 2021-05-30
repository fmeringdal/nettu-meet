import { accountRepo } from '../../../modules/account/repos';
import { Middleware } from './utils/Middleware';

const middleware = new Middleware(accountRepo);

export { middleware };
