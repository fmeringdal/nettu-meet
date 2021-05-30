import { Result } from '../../../shared/core/Result';
import { Entity } from '../../../shared/domain/Entity';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';

export interface ChatProps {
    messages: ChatMessage[];
    meetingId: UniqueEntityID;
}

export interface ChatMessage {
    id: UniqueEntityID;
    createdAt: Date;
    content: string;
    variant: ChatMessageVariant;
    sender: ChatMessageSender;
}

export interface ChatMessageSender {
    entity: ChatMessageSenderEntity;
    id: string;
}

export type ChatMessageSenderEntity = 'socket' | 'user';

export type ChatMessageVariant = 'general';

export class Chat extends Entity<ChatProps> {
    get chatId(): UniqueEntityID {
        return this._id;
    }

    get meetingId(): UniqueEntityID {
        return this.props.meetingId;
    }

    get messages(): ChatMessage[] {
        return this.props.messages;
    }

    public addMessage(message: ChatMessage) {
        this.props.messages.push(message);
    }

    public static create(props: ChatProps, id?: UniqueEntityID): Result<Chat> {
        const isNewChat = !!id === false;
        const chat = new Chat(
            {
                ...props,
            },
            id,
        );

        if (isNewChat) {
            //   chat.addDomainEvent(new ChatCreated(chat));
        }

        return Result.ok(chat);
    }
}
