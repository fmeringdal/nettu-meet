import { Request, Response, NextFunction } from 'express';
import { IAccountRepo } from '../../../../modules/account/repos/accountRepo';
import { DecodedExpressRequest } from '../models/decodedRequest';

export class Middleware {
    private accountRepo: IAccountRepo;

    constructor(accountRepo: IAccountRepo) {
        this.accountRepo = accountRepo;
    }

    private endRequest(status: 400 | 401 | 403, message: string, res: any): any {
        return res.status(status).send({ message });
    }

    public ensureAccountAdmin() {
        return async (req: Request, res: Response, next: NextFunction) => {
            const apiKey = req.headers['authorization']
                ? req.headers['authorization'].replace('Bearer', '').trim()
                : '';

            if (!apiKey) {
                return this.endRequest(403, 'Invalid secret api key provided', res);
            }

            const account = await this.accountRepo.getAccountBySecretKey(apiKey);
            if (!account) {
                return this.endRequest(403, 'Invalid secret api key provided', res);
            }

            (req as DecodedExpressRequest).decoded = {
                ...(req as DecodedExpressRequest).decoded,
                account: account!,
            };

            return next();
        };
    }
}
