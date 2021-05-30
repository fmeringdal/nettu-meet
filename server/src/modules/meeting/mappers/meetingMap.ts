import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Meeting, MeetingType, OpeningTime } from '../domain/meeting';
import { MeetingDTO } from '../dtos/meetingDTO';
import { ResourceMap, ResourcePersistenceRaw } from './resourceMap';

interface MeetingPersistenceRaw {
    _id: string;
    title: string;
    type: string;
    canvasIds: string[];
    chatId: string;
    activeCanvasId: string;
    redirectURI: string;
    account: {
        accountId: string;
        label: string;
        iconURL?: string;
    };
    resources: ResourcePersistenceRaw[];
    openingTime?: OpeningTime;
}

export class MeetingMap {
    public static toDTO(meeting: Meeting): MeetingDTO {
        return {
            id: meeting.meetingId.toString(),
            canvasIds: meeting.canvasIds.map((id) => id.toString()),
            activeCanvasId: meeting.activeCanvasId.toString(),
            chatId: meeting.chatId.toString(),
            account: {
                id: meeting.account.accountId,
                label: meeting.account.label,
                iconURL: meeting.account.iconURL,
            },
            title: meeting.title,
            type: meeting.type,
            redirectURI: meeting.redirectURI,
            resources: meeting.resources.map((r) => ResourceMap.toDTO(r)),
            openingTime: meeting.openingTime,
        };
    }

    public static toDomain(raw: MeetingPersistenceRaw): Meeting {
        return Meeting.create(
            {
                title: raw.title,
                account: raw.account,
                canvasIds: raw.canvasIds.map((id) => UniqueEntityID.createFromString(id)),
                activeCanvasId: UniqueEntityID.createFromString(raw.activeCanvasId),
                chatId: UniqueEntityID.createFromString(raw.chatId),
                type: raw.type as MeetingType,
                redirectURI: raw.redirectURI,
                resources: raw.resources.map((r) => ResourceMap.toDomain(r)),
                openingTime: raw.openingTime,
            },
            new UniqueEntityID(raw._id),
        ).getValue();
    }

    public static toPersistence(meeting: Meeting): MeetingPersistenceRaw {
        return {
            _id: meeting.meetingId.toValue(),
            canvasIds: meeting.canvasIds.map((id) => id.toString()),
            activeCanvasId: meeting.activeCanvasId.toString(),
            chatId: meeting.chatId.toString(),
            account: meeting.account,
            title: meeting.title,
            type: meeting.type,
            redirectURI: meeting.redirectURI,
            resources: meeting.resources.map((r) => ResourceMap.toPersistence(r)),
            openingTime: meeting.openingTime,
        };
    }
}
