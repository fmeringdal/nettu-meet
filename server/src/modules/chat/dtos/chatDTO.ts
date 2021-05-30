import { ChatMessageDTO } from './chatMessageDTO';

export interface ChatDTO {
    id: string;
    meetingId: string;
    messages: ChatMessageDTO[];
}
