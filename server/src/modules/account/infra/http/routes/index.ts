import express from 'express';
import { middleware } from '../../../../../shared/infra/http';
import { createAccountController } from '../../../useCases/createAccount';
import { updateAccountController } from '../../../useCases/updateAccount';

const accountRouter = express.Router();

accountRouter.post('/', (req, res) => createAccountController.execute(req, res));

accountRouter.put('/', middleware.ensureAccountAdmin(), (req, res) => updateAccountController.execute(req, res));

export { accountRouter };
