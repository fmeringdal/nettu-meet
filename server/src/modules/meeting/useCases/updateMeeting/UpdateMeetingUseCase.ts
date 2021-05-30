import { AppError } from '../../../../shared/core/AppError';
import { Either, left, Result, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { Meeting } from '../../domain/meeting';
import { IMeetingRepo } from '../../repos/meetingRepo';
import { UpdateMeetingDTO } from './UpdateMeetingDTO';
import { UpdateMeetingUseCaseErrors } from './UpdateMeetingErrors';

type Response = Either<
    | UpdateMeetingUseCaseErrors.MeetingNotFoundError
    | UpdateMeetingUseCaseErrors.InvalidPropertyError
    | AppError.UnexpectedError,
    Result<void>
>;

export class UpdateMeetingUseCase implements UseCase<UpdateMeetingDTO, Promise<Response>> {
    private meetingRepo: IMeetingRepo;

    constructor(meetingRepo: IMeetingRepo) {
        this.meetingRepo = meetingRepo;
    }

    public async execute(request: UpdateMeetingDTO): Promise<Response> {
        try {
            const account = request.account;
            let meeting = await this.meetingRepo.getMeetingByMeetingId(request.meetingId.toString());
            if (meeting == null || account.accountId.toString() !== meeting.account.accountId) {
                return left(new UpdateMeetingUseCaseErrors.MeetingNotFoundError(request.meetingId.toString()));
            }

            const updateDescription: any = {};
            const keys = ['title', 'redirectURI', 'openingTime'];
            for (const key of keys) {
                if (key in request) {
                    updateDescription[key] = (request as any)[key];
                }
            }

            const meetingOrErr = Meeting.create(
                {
                    ...meeting.props,
                    ...updateDescription,
                },
                account.accountId,
            );

            if (meetingOrErr.isFailure) {
                return left(new UpdateMeetingUseCaseErrors.InvalidPropertyError(meetingOrErr.error as string));
            }
            meeting = meetingOrErr.getValue();

            await this.meetingRepo.save(meeting);

            return right(Result.ok());
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
