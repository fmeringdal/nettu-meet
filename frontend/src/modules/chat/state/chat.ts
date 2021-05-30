import create from "zustand";
import { Chat } from "../models/chat";

type ChatState = {
  visible: boolean;
  chat?: Chat;
  unreadCount: number;
};

export const useChatState = create<ChatState>((set) => ({
  visible: false,
  unreadCount: 0,
}));
