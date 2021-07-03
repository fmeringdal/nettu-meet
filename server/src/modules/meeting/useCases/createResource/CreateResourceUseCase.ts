import { awsConfig } from '../../../../config';
import { AppError } from '../../../../shared/core/AppError';
import { Either, left, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { IFileStorage } from '../../../../shared/services/filestorage/fileStorage';
import { Meeting } from '../../domain/meeting';
import { Resource } from '../../domain/resource';
import { ResourceMap } from '../../mappers/resourceMap';
import { IMeetingRepo } from '../../repos/meetingRepo';
import { CreateResourceDTO, CreateResourceResponseDTO } from './CreateResourceDTO';
import { CreateResourceUseCaseErrors } from './CreateResourceErrors';

type Response = Either<
    | CreateResourceUseCaseErrors.MeetingNotFoundError
    | CreateResourceUseCaseErrors.ResourceLimitReachedError
    | AppError.UnexpectedError,
    CreateResourceResponseDTO
>;

export class CreateResourceUseCase implements UseCase<CreateResourceDTO, Promise<Response>> {
    private meetingRepo: IMeetingRepo;
    private fileStorage: IFileStorage;

    constructor(meetingRepo: IMeetingRepo, fileStorage: IFileStorage) {
        this.meetingRepo = meetingRepo;
        this.fileStorage = fileStorage;
    }

    public async execute(request: CreateResourceDTO): Promise<Response> {
        let meeting: Meeting | undefined;

        try {
            meeting = await this.meetingRepo.getMeetingByMeetingId(request.meetingId);

            if (!meeting) {
                return left(new CreateResourceUseCaseErrors.MeetingNotFoundError(request.meetingId));
            }

            if (request.canvasId && !meeting.canvasIds.map((id) => id.toString()).includes(request.canvasId)) {
                return left(new CreateResourceUseCaseErrors.CanvasNotFoundError(request.meetingId, request.canvasId));
            }

            if (!awsConfig.mediaBucket) {
                return left(new CreateResourceUseCaseErrors.ResourceUploadNotSupportedError());
            }

            const resourceId = new UniqueEntityID();

            const key = `meetings/${meeting.meetingId.toString()}/resources/${resourceId.toString()}`;

            const { signedRequest, url, bucketName } = await this.fileStorage.storePublicFile(
                request.contentType,
                'media',
                key,
            );

            const resource: Resource = {
                resourceId,
                name: request.name,
                contentType: request.contentType,
                canvasId: request.canvasId ? UniqueEntityID.createFromString(request.canvasId) : undefined,
                publicURL: url,
                storage: {
                    bucketName,
                    key,
                },
            };

            meeting.addResource(resource);

            await this.meetingRepo.save(meeting);

            return right({
                signedUploadURL: signedRequest,
                resource: ResourceMap.toDTO(resource),
            });
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
