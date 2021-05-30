import { AppError } from '../../../../shared/core/AppError';
import { Either, left, Result, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { SetCanvasDataDTO } from './SetCanvasDataDTO';
import { SetCanvasDataUseCaseErrors } from './SetCanvasDataErrors';

import { ICanvasRepo } from '../../repos/canvasRepo';

type Response = Either<SetCanvasDataUseCaseErrors.CanvasNotFoundError | AppError.UnexpectedError, Result<void>>;

export class SetCanvasDataUseCase implements UseCase<SetCanvasDataDTO, Promise<Response>> {
    private canvasRepo: ICanvasRepo;

    constructor(canvasRepo: ICanvasRepo) {
        this.canvasRepo = canvasRepo;
    }

    public async execute(request: SetCanvasDataDTO): Promise<Response> {
        try {
            await this.canvasRepo.setCanvasData(request.canvasId, request.meetingId, request.canvasJSON);
            return right(Result.ok());
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
