import Joi from 'joi';
import { Socket } from 'socket.io';
import { logger } from "../../../../logger"

export abstract class BaseWSController<T = {}> {
    private reqSchema: Joi.Schema<T>;

    constructor(req: Joi.Schema<T>) {
        this.reqSchema = req;
    }

    protected abstract executeImpl(socket: Socket, payload: T): Promise<void | any>;

    public async execute(socket: Socket, req: any): Promise<void> {
        req = req != null ? req : {};
        const schemaValidationRes = this.reqSchema.validate(req);
        if (schemaValidationRes.error) {
            return;
        }
        const payload = schemaValidationRes.value as T;

        try {
            await this.executeImpl(socket, payload);
        } catch (err) {
            logger.error({error : err}, `[BaseController]: Uncaught controller error`);
        }
    }
}
