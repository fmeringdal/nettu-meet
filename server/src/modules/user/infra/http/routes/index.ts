import express from 'express';
import { createEmailVerificationController } from '../../../useCases/createEmailVerificationCode';
import { validateEmailVerificationController } from '../../../useCases/validateEmailVerificationCode';

const userRouter = express.Router();

userRouter.post('/email-verification', (req, res) => createEmailVerificationController.execute(req, res));

userRouter.post('/email-verification/validate', (req, res) => validateEmailVerificationController.execute(req, res));

export { userRouter };
