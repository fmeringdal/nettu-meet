import * as express from 'express';
import Joi from 'joi';
import { Account } from '../../../../modules/account/domain/account';
import { DecodedExpressRequest } from './decodedRequest';
import { logger } from "../../../../logger"

// eslint-disable-next-line @typescript-eslint/ban-types
export interface NettuAppRequest<B = {}, P = {}> {
    body: B;
    pathParams: P;
    account?: Account;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class BaseController<B = {}, P = {}> {
    private bodySchema: Joi.ObjectSchema<B>;
    private pathParamsSchema: Joi.ObjectSchema<P>;

    constructor(body: Joi.ObjectSchema<B> | null, pathParams: Joi.ObjectSchema<P> | null) {
        this.bodySchema = body ? body : Joi.object({});
        this.pathParamsSchema = pathParams ? pathParams : Joi.object({});
    }

    protected abstract executeImpl(req: NettuAppRequest<B, P>, res: NettuAppResponse): Promise<void>;

    public async execute(req: express.Request, _res: express.Response): Promise<void> {
        const res = new NettuAppResponse(_res);
        const reqBody = req.body != null ? req.body : {};
        const reqPathParams = req.params != null ? req.params : {};

        const bodySchemaValidationRes = this.bodySchema.validate(reqBody);
        if (bodySchemaValidationRes.error) {
            return res.badClientData(bodySchemaValidationRes.error.message);
        }

        const pathParamsSchemaValidationRes = this.pathParamsSchema.validate(reqPathParams);
        if (pathParamsSchemaValidationRes.error) {
            return res.badClientData(pathParamsSchemaValidationRes.error.message);
        }

        let account;
        const maybeDecodedReq = req as DecodedExpressRequest;
        if (maybeDecodedReq.decoded && maybeDecodedReq.decoded.account) {
            account = maybeDecodedReq.decoded.account;
        }

        const nettuReq: NettuAppRequest<B, P> = {
            body: bodySchemaValidationRes.value,
            pathParams: pathParamsSchemaValidationRes.value,
            account,
        };
        try {
            this.executeImpl(nettuReq, res);
        } catch (error) {
            logger.error({error : error},`[BaseController]: Uncaught controller error`);
            res.fail();
        }
    }
}

export class NettuAppResponse {
    private res: express.Response;
    private sent: boolean;

    constructor(res: express.Response) {
        this.sent = false;
        this.res = res;
    }

    private jsonResponse(code: number, dto: any): void {
        if (this.sent) {
            throw new Error('Cannot send response twice');
        }
        this.sent = true;
        this.res.status(code).json(dto);
    }

    public ok<T>(dto?: T): void {
        return this.jsonResponse(200, dto);
    }

    public created<T>(dto?: T): void {
        return this.jsonResponse(201, dto);
    }

    public badClientData(message?: string): void {
        return this.jsonResponse(400, {
            message: message ? message : 'Bad client request',
        });
    }

    public unauthorized(message?: string): void {
        return this.jsonResponse(401, {
            message: message ? message : 'Unauthorized',
        });
    }

    public forbidden(message?: string): void {
        return this.jsonResponse(403, {
            message: message ? message : 'Forbidden',
        });
    }

    public notFound(message?: string): void {
        return this.jsonResponse(404, {
            message: message ? message : 'Not found',
        });
    }

    public conflict(message?: string): void {
        return this.jsonResponse(409, {
            message: message ? message : 'Conflict',
        });
    }

    public fail(): void {
        return this.jsonResponse(500, {
            message: 'An unexpected error occurred',
        });
    }
}
