import { create } from 'zustand';
import { Conversation, Message } from '../types';
import { chatService } from '../services/chat';

interface ChatState {
  conversations: Conversation[];
  currentConversationId: number | null;
  currentTitle: string | null;
  messages: Message[];
  selectedDocumentId: number | null;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
  
  setSelectedDocumentId: (docId: number | null) => void;
  fetchConversations: () => Promise<void>;
  selectConversation: (conversationId: number) => Promise<void>;
  startNewChat: () => void;
  sendMessage: (prompt: string) => Promise<void>;
  renameConversation: (conversationId: number, title: string) => Promise<void>;
  deleteConversation: (conversationId: number) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  currentTitle: null,
  messages: [],
  selectedDocumentId: null,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,

  setSelectedDocumentId: (docId: number | null) => set({ selectedDocumentId: docId }),

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const convs = await chatService.getConversations();
      set({ conversations: convs, isLoadingConversations: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Failed to load conversations',
        isLoadingConversations: false,
      });
    }
  },

  selectConversation: async (conversationId: number) => {
    set({ currentConversationId: conversationId, isLoadingMessages: true });
    try {
      const detail = await chatService.getConversationDetail(conversationId);
      set({
        currentTitle: detail.title,
        messages: detail.messages,
        isLoadingMessages: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Failed to load conversation messages',
        isLoadingMessages: false,
      });
    }
  },

  startNewChat: () => {
    set({
      currentConversationId: null,
      currentTitle: 'New Conversation',
      messages: [],
      error: null,
    });
  },

  sendMessage: async (prompt: string) => {
    const { currentConversationId, selectedDocumentId, messages } = get();

    // Optimistically add user message to list
    const tempUserMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: prompt,
      created_at: new Date().toISOString(),
    };

    set({
      messages: [...messages, tempUserMsg],
      isSending: true,
      error: null,
    });

    try {
      const res = await chatService.sendMessage(
        prompt,
        currentConversationId || undefined,
        selectedDocumentId || undefined
      );

      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.response,
        sources: res.sources,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        currentConversationId: res.conversation_id,
        currentTitle: res.title || state.currentTitle,
        messages: [...state.messages, assistantMsg],
        isSending: false,
      }));

      // Refresh conversation list to get latest preview/timestamp
      get().fetchConversations();
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Failed to generate AI response',
        isSending: false,
      });
    }
  },

  renameConversation: async (conversationId: number, title: string) => {
    try {
      const updated = await chatService.renameConversation(conversationId, title);
      set((state) => ({
        conversations: state.conversations.map((c) => (c.id === conversationId ? updated : c)),
        currentTitle: state.currentConversationId === conversationId ? title : state.currentTitle,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to rename conversation' });
    }
  },

  deleteConversation: async (conversationId: number) => {
    try {
      await chatService.deleteConversation(conversationId);
      set((state) => {
        const remaining = state.conversations.filter((c) => c.id !== conversationId);
        const isCurrent = state.currentConversationId === conversationId;
        return {
          conversations: remaining,
          currentConversationId: isCurrent ? null : state.currentConversationId,
          messages: isCurrent ? [] : state.messages,
          currentTitle: isCurrent ? null : state.currentTitle,
        };
      });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to delete conversation' });
    }
  },
}));
