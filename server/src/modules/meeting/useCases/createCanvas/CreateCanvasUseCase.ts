import { AppError } from '../../../../shared/core/AppError';
import { Either, left, Result, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { Canvas } from '../../domain/canvas';
import { Meeting } from '../../domain/meeting';
import { ICanvasRepo } from '../../repos/canvasRepo';
import { IMeetingRepo } from '../../repos/meetingRepo';
import { CreateCanvasDTO } from './CreateCanvasDTO';
import { CreateCanvasUseCaseErrors } from './CreateCanvasErrors';

type Response = Either<
    | CreateCanvasUseCaseErrors.MeetingNotFoundError
    | CreateCanvasUseCaseErrors.CanvasLimitReachedError
    | AppError.UnexpectedError,
    UniqueEntityID
>;

export class CreateCanvasUseCase implements UseCase<CreateCanvasDTO, Promise<Response>> {
    private meetingRepo: IMeetingRepo;
    private canvasRepo: ICanvasRepo;

    constructor(meetingRepo: IMeetingRepo, canvasRepo: ICanvasRepo) {
        this.meetingRepo = meetingRepo;
        this.canvasRepo = canvasRepo;
    }

    public async execute(request: CreateCanvasDTO): Promise<Response> {
        let meeting: Meeting | undefined;

        try {
            meeting = await this.meetingRepo.getMeetingByMeetingId(request.meetingId);

            if (!meeting) {
                return left(new CreateCanvasUseCaseErrors.MeetingNotFoundError(request.meetingId));
            }

            const defaultCanvas: Canvas = {
                canvasId: new UniqueEntityID(),
                meetingId: meeting.meetingId,
                data: JSON.stringify({
                    objects: [],
                    background: '',
                }),
            };

            meeting.addCanvas(defaultCanvas.canvasId);
            meeting.setActiveCanvas(defaultCanvas.canvasId);

            await Promise.all([this.meetingRepo.save(meeting), this.canvasRepo.insert(defaultCanvas)]);

            return right(defaultCanvas.canvasId);
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
