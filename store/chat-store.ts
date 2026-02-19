'use client';

import { create } from 'zustand';
import type { Chat, Message } from '@/lib/types';

interface ChatState {
  chats: Chat[];
  messages: Message[];
  setChats: (chats: Chat[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  messages: [],
  setChats: (chats) => set({ chats }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));
