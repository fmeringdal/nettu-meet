import { AppError } from '../../../../shared/core/AppError';
import { Either, left, Result, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { Meeting } from '../../domain/meeting';
import { IMeetingRepo } from '../../repos/meetingRepo';
import { CreateMeetingDTO, CreateMeetingResponseDTO } from './CreateMeetingDTO';
import { CreateMeetingUseCaseErrors } from './CreateMeetingErrors';

import * as config from '../../../../config';
import { ICanvasRepo } from '../../repos/canvasRepo';
import { Canvas } from '../../domain/canvas';
import { Chat } from '../../../chat/domain/chat';
import { IChatRepo } from '../../../chat/repos/chatRepo';

type Response = Either<
    | CreateMeetingUseCaseErrors.InvalidPropertyError
    | CreateMeetingUseCaseErrors.ForbiddenRedirectError
    | AppError.UnexpectedError,
    CreateMeetingResponseDTO
>;

export class CreateMeetingUseCase implements UseCase<CreateMeetingDTO, Promise<Response>> {
    private meetingRepo: IMeetingRepo;
    private canvasRepo: ICanvasRepo;
    private chatRepo: IChatRepo;

    constructor(meetingRepo: IMeetingRepo, canvasRepo: ICanvasRepo, chatRepo: IChatRepo) {
        this.meetingRepo = meetingRepo;
        this.canvasRepo = canvasRepo;
        this.chatRepo = chatRepo;
    }

    public async execute(request: CreateMeetingDTO): Promise<Response> {
        let meeting: Meeting | undefined;

        try {
            if (request.redirectURI && !request.account.redirectURIs.includes(request.redirectURI)) {
                return left(
                    new CreateMeetingUseCaseErrors.ForbiddenRedirectError(
                        request.redirectURI,
                        request.account.redirectURIs,
                    ),
                );
            }
            const redirectURI = request.redirectURI
                ? request.redirectURI
                : request.account.defaultRedirectURI
                ? request.account.defaultRedirectURI
                : config.baseFrontendURL;

            const defaultCanvasId = new UniqueEntityID();
            const chatId = new UniqueEntityID();

            const meetingOrErr = Meeting.create({
                title: request.title,
                canvasIds: [defaultCanvasId],
                activeCanvasId: defaultCanvasId,
                openingTime: request.openingTime,
                type: 'open',
                account: {
                    accountId: request.account.accountId.toString(),
                    label: request.account.label,
                    iconURL: request.account.iconURL,
                },
                chatId,
                resources: [],
                redirectURI,
            });

            if (meetingOrErr.isFailure) {
                return left(new CreateMeetingUseCaseErrors.InvalidPropertyError(meetingOrErr.error as string));
            }
            meeting = meetingOrErr.getValue();

            const defaultCanvas: Canvas = {
                canvasId: defaultCanvasId,
                meetingId: meeting.meetingId,
                data: JSON.stringify({
                    objects: [],
                    background: '',
                }),
            };

            const chat: Chat = Chat.create(
                {
                    meetingId: meeting.meetingId,
                    messages: [],
                },
                chatId,
            ).getValue();

            await Promise.all([this.chatRepo.insert(chat), this.canvasRepo.insert(defaultCanvas)]);

            await this.meetingRepo.insert(meeting);

            const meetingId = meeting.meetingId.toString();

            const entrypoints = [{ url: `${config.baseFrontendURL}/meeting/${meetingId}` }];

            return right({
                meetingId,
                entrypoints,
            });
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
