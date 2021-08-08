import { Result } from './Result';
import { UseCaseError } from './UseCaseError';
import {logger} from "../../logger"

export namespace AppError {
    export class UnexpectedError extends Result<UseCaseError> {
        public constructor(err: any) {
            console.trace();
            super(false, {
                message: `An unexpected error occurred.`,
                error: err,
            } as UseCaseError);
            logger.error({error : err}, `[AppError]: An unexpected error occurred`);
        }

        public static create(err: any): UnexpectedError {
            return new UnexpectedError(err);
        }
    }
}
