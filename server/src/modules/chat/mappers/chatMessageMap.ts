import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { ChatMessage, ChatMessageSenderEntity, ChatMessageVariant } from '../domain/chat';
import { ChatMessageDTO } from '../dtos/chatMessageDTO';

export interface ChatMessagePersistenceRaw {
    id: string;
    createdAt: number;
    content: string;
    variant: ChatMessageVariant;
    sender: {
        entity: ChatMessageSenderEntity;
        id: string;
    };
}

export class ChatMessageMap {
    public static toDTO(message: ChatMessage): ChatMessageDTO {
        return {
            id: message.id.toString(),
            content: message.content,
            createdAt: message.createdAt.valueOf(),
            sender: message.sender,
            variant: message.variant,
        };
    }

    public static toDomain(raw: ChatMessagePersistenceRaw): ChatMessage {
        return {
            content: raw.content,
            createdAt: new Date(raw.createdAt),
            id: UniqueEntityID.createFromString(raw.id),
            sender: raw.sender,
            variant: raw.variant,
        };
    }

    public static toPersistence(message: ChatMessage): ChatMessagePersistenceRaw {
        return {
            id: message.id.toString(),
            content: message.content,
            createdAt: message.createdAt.valueOf(),
            sender: message.sender,
            variant: message.variant,
        };
    }
}
