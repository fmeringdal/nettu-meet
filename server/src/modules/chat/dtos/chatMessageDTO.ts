import { ChatMessageSenderEntity, ChatMessageVariant } from '../domain/chat';

interface ChatMessageSenderDTO {
    entity: ChatMessageSenderEntity;
    id: string;
}

export interface ChatMessageDTO {
    id: string;
    createdAt: number;
    content: string;
    variant: ChatMessageVariant;
    sender: ChatMessageSenderDTO;
}
