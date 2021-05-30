import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Chat } from '../domain/chat';
import { ChatDTO } from '../dtos/chatDTO';
import { ChatMessageMap, ChatMessagePersistenceRaw } from './chatMessageMap';

interface ChatPersistenceRaw {
    _id: string;
    meetingId: string;
    messages: ChatMessagePersistenceRaw[];
}

export class ChatMap {
    public static toDTO(chat: Chat): ChatDTO {
        return {
            id: chat.chatId.toString(),
            meetingId: chat.meetingId.toString(),
            messages: chat.messages.map((m) => ChatMessageMap.toDTO(m)),
        };
    }

    public static toDomain(raw: ChatPersistenceRaw): Chat {
        return Chat.create(
            {
                meetingId: UniqueEntityID.createFromString(raw.meetingId),
                messages: raw.messages.map((m) => ChatMessageMap.toDomain(m)),
            },
            new UniqueEntityID(raw._id),
        ).getValue();
    }

    public static toPersistence(chat: Chat): ChatPersistenceRaw {
        return {
            _id: chat.chatId.toValue(),
            meetingId: chat.meetingId.toString(),
            messages: chat.messages.map((m) => ChatMessageMap.toPersistence(m)),
        };
    }
}
