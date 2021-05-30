import { AppError } from '../../../../shared/core/AppError';
import { Either, left, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { AccountMap } from '../../../account/mappers/accountMap';
import { IAccountRepo } from '../../../account/repos/accountRepo';
import { Meeting } from '../../domain/meeting';
import { MeetingMap } from '../../mappers/meetingMap';
import { IMeetingRepo } from '../../repos/meetingRepo';
import { GetMeetingDTO, GetMeetingResponseDTO } from './GetMeetingDTO';
import { GetMeetingUseCaseErrors } from './GetMeetingErrors';

type Response = Either<GetMeetingUseCaseErrors.MeetingNotFoundError | AppError.UnexpectedError, GetMeetingResponseDTO>;

export class GetMeetingUseCase implements UseCase<GetMeetingDTO, Promise<Response>> {
    private meetingRepo: IMeetingRepo;
    private accountRepo: IAccountRepo;

    constructor(meetingRepo: IMeetingRepo, accountRepo: IAccountRepo) {
        this.meetingRepo = meetingRepo;
        this.accountRepo = accountRepo;
    }

    public async execute(request: GetMeetingDTO): Promise<Response> {
        let meeting: Meeting | undefined;

        try {
            meeting = await this.meetingRepo.getMeetingByMeetingId(request.meetingId);

            if (!meeting) {
                return left(new GetMeetingUseCaseErrors.MeetingNotFoundError(request.meetingId as string));
            }

            const comp = await this.accountRepo.getAccountByAccountId(meeting.account.accountId);

            return right({
                meeting: MeetingMap.toDTO(meeting),
                account: AccountMap.toDTO(comp!),
            });
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
