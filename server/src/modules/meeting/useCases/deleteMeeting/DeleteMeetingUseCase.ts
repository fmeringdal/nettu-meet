import { AppError } from '../../../../shared/core/AppError';
import { Either, left, Result, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { Meeting } from '../../domain/meeting';
import { IMeetingRepo } from '../../repos/meetingRepo';
import { DeleteMeetingDTO } from './DeleteMeetingDTO';
import { DeleteMeetingUseCaseErrors } from './DeleteMeetingErrors';

type Response = Either<DeleteMeetingUseCaseErrors.MeetingNotFoundError | AppError.UnexpectedError, Result<void>>;

export class DeleteMeetingUseCase implements UseCase<DeleteMeetingDTO, Promise<Response>> {
    private meetingRepo: IMeetingRepo;

    constructor(meetingRepo: IMeetingRepo) {
        this.meetingRepo = meetingRepo;
    }

    public async execute(request: DeleteMeetingDTO): Promise<Response> {
        try {
            const account = request.account;
            const meeting = await this.meetingRepo.getMeetingByMeetingId(request.meetingId.toString());
            if (meeting == null || account.accountId.toString() !== meeting.account.accountId) {
                return left(new DeleteMeetingUseCaseErrors.MeetingNotFoundError(request.meetingId.toString()));
            }

            await this.meetingRepo.deleteMeetingByMeetingId(meeting.meetingId.toString());

            return right(Result.ok());
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
