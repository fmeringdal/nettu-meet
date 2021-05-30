import { AppError } from '../../../../shared/core/AppError';
import { Either, left, Result, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { Meeting } from '../../domain/meeting';
import { IMeetingRepo } from '../../repos/meetingRepo';
import { SetActiveCanvasDTO } from './SetActiveCanvasDTO';
import { SetActiveCanvasUseCaseErrors } from './SetActiveCanvasErrors';

import * as config from '../../../../config';
import { ICanvasRepo } from '../../repos/canvasRepo';
import { Canvas } from '../../domain/canvas';

type Response = Either<SetActiveCanvasUseCaseErrors.CanvasNotFoundError | AppError.UnexpectedError, Result<void>>;

export class SetActiveCanvasUseCase implements UseCase<SetActiveCanvasDTO, Promise<Response>> {
    private meetingRepo: IMeetingRepo;

    constructor(meetingRepo: IMeetingRepo) {
        this.meetingRepo = meetingRepo;
    }

    public async execute(request: SetActiveCanvasDTO): Promise<Response> {
        try {
            await this.meetingRepo.setMeetingActiveCanvas(request.meetingId, request.canvasId);
            return right(Result.ok());
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
