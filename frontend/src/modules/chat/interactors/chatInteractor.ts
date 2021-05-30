import { signalingChannel } from "../../../shared/services/theme/signalling";
import { Meeting } from "../../meeting/domain/meeting";
import { meetingState, MeetingState } from "../../meeting/state/meeting";
import { chatService, IChatService } from "../services/chatService";
import { useChatState } from "../state/chat";

export interface IChatInteractor {
  sendChatMessage(content: string): Promise<void>;
  getChat(): Promise<void>;
  toggleChatVisibility(): void;
}

class ChatInteractor implements IChatInteractor {
  private isSetup: boolean;
  private chatService: IChatService;
  constructor(chatService: IChatService) {
    this.isSetup = false;
    this.chatService = chatService;
  }

  async sendChatMessage(content: string) {
    const meeting = meetingState.getState();
    if (meeting.meeting == null) return;
    await this.chatService.sendChatMessage(meeting.meeting.chatId, content);
  }

  private addMessageToChat(message: any) {
    const state = { ...useChatState.getState() };
    if (!state.chat) return;
    if (!state.visible) {
      state.unreadCount += 1;
    }
    state.chat.messages.push(message);
    useChatState.setState(state);
  }

  async getChat() {
    let meeting: MeetingState | undefined;
    while (meeting == null || meeting.meeting == null) {
      meeting = meetingState.getState();
      await new Promise((res) => setTimeout(() => res("OK"), 1000));
    }
    const chatOrErr = await this.chatService.getChat(
      meeting.meeting.id,
      meeting.meeting.chatId
    );

    if (chatOrErr.isFailure) return;
    const chat = chatOrErr.getValue();
    const state = { ...useChatState.getState() };
    state.chat = chat;
    useChatState.setState(state);
  }

  toggleChatVisibility() {
    const state = { ...useChatState.getState() };
    state.visible = !state.visible;
    if (state.visible) {
      state.unreadCount = 0;
    }
    useChatState.setState(state);
  }

  setup() {
    if (this.isSetup) {
      return;
    }
    this.isSetup = true;
    this.getChat();
    signalingChannel.on("chat-message", (data: any) => {
      this.addMessageToChat(data.message);
    });
  }
}

export const chatInteractor = new ChatInteractor(chatService);
