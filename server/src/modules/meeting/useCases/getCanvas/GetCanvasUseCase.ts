import { AppError } from '../../../../shared/core/AppError';
import { Either, left, Result, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { Meeting } from '../../domain/meeting';
import { IMeetingRepo } from '../../repos/meetingRepo';
import { GetCanvasDTO } from './GetCanvasDTO';
import { GetCanvasUseCaseErrors } from './GetCanvasErrors';

import * as config from '../../../../config';
import { ICanvasRepo } from '../../repos/canvasRepo';
import { Canvas } from '../../domain/canvas';

type Response = Either<GetCanvasUseCaseErrors.CanvasNotFoundError | AppError.UnexpectedError, Canvas>;

export class GetCanvasUseCase implements UseCase<GetCanvasDTO, Promise<Response>> {
    private canvasRepo: ICanvasRepo;

    constructor(canvasRepo: ICanvasRepo) {
        this.canvasRepo = canvasRepo;
    }

    public async execute(request: GetCanvasDTO): Promise<Response> {
        let canvas: Canvas | undefined;

        try {
            canvas = await this.canvasRepo.getCanvasByCanvasId(request.canvasId);

            if (!canvas) {
                return left(new GetCanvasUseCaseErrors.CanvasNotFoundError(request.canvasId as string));
            }

            return right(canvas);
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
