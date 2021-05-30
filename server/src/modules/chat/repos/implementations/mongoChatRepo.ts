import { BaseRepo } from '../../../../shared/infra/db/BaseRepo';
import { _db_connect_promise } from '../../../../shared/infra/db/connection';
import { Chat, ChatMessage } from '../../domain/chat';
import { ChatMap } from '../../mappers/chatMap';
import { ChatMessageMap } from '../../mappers/chatMessageMap';
import { IChatRepo } from '../chatRepo';

export class MongoChatRepo extends BaseRepo implements IChatRepo {
    constructor() {
        super(_db_connect_promise, 'chats');
    }

    async insertMessage(chatId: string, chatMessage: ChatMessage): Promise<void> {
        const raw = ChatMessageMap.toPersistence(chatMessage);
        await this.collection.findOneAndUpdate(
            {
                _id: chatId,
            },
            {
                $push: {
                    messages: raw,
                },
            },
        );
    }

    async getChatByChatId(id: string): Promise<Chat | undefined> {
        const chat = await this.collection.findOne({
            _id: id,
        });
        return chat ? ChatMap.toDomain(chat) : undefined;
    }

    async insert(chat: Chat): Promise<void> {
        const raw = ChatMap.toPersistence(chat);
        await this.collection.insertOne(raw);
    }

    async save(chat: Chat): Promise<void> {
        const raw = ChatMap.toPersistence(chat);
        await this.collection.updateOne({ _id: raw._id }, { $set: { ...raw } });
    }
}
