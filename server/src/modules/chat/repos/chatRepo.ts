import { Chat, ChatMessage } from '../domain/chat';

export interface IChatRepo {
    getChatByChatId(id: string): Promise<Chat | undefined>;
    insertMessage(chatId: string, chatMessage: ChatMessage): Promise<void>;
    insert(chat: Chat): Promise<void>;
    save(chat: Chat): Promise<void>;
}
