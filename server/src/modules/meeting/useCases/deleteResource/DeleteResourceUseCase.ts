import { AppError } from '../../../../shared/core/AppError';
import { Either, left, Result, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { IFileStorage } from '../../../../shared/services/filestorage/fileStorage';
import { Meeting } from '../../domain/meeting';
import { Resource } from '../../domain/resource';
import { ResourceMap } from '../../mappers/resourceMap';
import { IMeetingRepo } from '../../repos/meetingRepo';
import { DeleteResourceDTO } from './DeleteResourceDTO';
import { DeleteResourceUseCaseErrors } from './DeleteResourceErrors';

type Response = Either<
    | DeleteResourceUseCaseErrors.MeetingNotFoundError
    | DeleteResourceUseCaseErrors.ResourceNotFoundError
    | AppError.UnexpectedError,
    Result<void>
>;

export class DeleteResourceUseCase implements UseCase<DeleteResourceDTO, Promise<Response>> {
    private meetingRepo: IMeetingRepo;
    private fileStorage: IFileStorage;

    constructor(meetingRepo: IMeetingRepo, fileStorage: IFileStorage) {
        this.meetingRepo = meetingRepo;
        this.fileStorage = fileStorage;
    }

    public async execute(request: DeleteResourceDTO): Promise<Response> {
        let meeting: Meeting | undefined;

        try {
            meeting = await this.meetingRepo.getMeetingByMeetingId(request.meetingId);

            if (!meeting) {
                return left(new DeleteResourceUseCaseErrors.MeetingNotFoundError(request.meetingId));
            }

            const resource = meeting.resources.find((r) => r.resourceId.toString() === request.resourceId);

            if (!resource) {
                return left(
                    new DeleteResourceUseCaseErrors.ResourceNotFoundError(request.meetingId, request.resourceId),
                );
            }

            meeting.removeResource(request.resourceId);

            const key = `meetings/${meeting.meetingId.toString()}/resources/${resource.resourceId.toString()}`;

            const res = await this.fileStorage.delete('media', key);
            if (res.isSuccess) {
                await this.meetingRepo.save(meeting);
            }

            return right(Result.ok());
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
