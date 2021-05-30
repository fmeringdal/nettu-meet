type ChatMessageSenderEntity = "socket" | "user";

type ChatMessageVariant = "general";

interface ChatMessageSender {
  entity: ChatMessageSenderEntity;
  id: string;
}

export interface ChatMessage {
  id: string;
  createdAt: number;
  content: string;
  variant: ChatMessageVariant;
  sender: ChatMessageSender;
}

export interface Chat {
  id: string;
  meetingId: string;
  messages: ChatMessage[];
}
