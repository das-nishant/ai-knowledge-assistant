import { api } from './api';
import { Conversation, ConversationDetail, CitationSource } from '../types';

export interface ChatResponsePayload {
  response: string;
  conversation_id: number;
  title?: string;
  sources: CitationSource[];
}

export const chatService = {
  async sendMessage(
    message: string,
    conversationId?: number,
    documentId?: number
  ): Promise<ChatResponsePayload> {
    const response = await api.post<ChatResponsePayload>('/chat', {
      message,
      conversation_id: conversationId || null,
      document_id: documentId || null,
    });
    return response.data;
  },

  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>('/conversations');
    return response.data;
  },

  async getConversationDetail(conversationId: number): Promise<ConversationDetail> {
    const response = await api.get<ConversationDetail>(`/conversations/${conversationId}`);
    return response.data;
  },

  async renameConversation(conversationId: number, title: string): Promise<Conversation> {
    const response = await api.patch<Conversation>(`/conversations/${conversationId}`, {
      title,
    });
    return response.data;
  },

  async deleteConversation(conversationId: number): Promise<void> {
    await api.delete(`/conversations/${conversationId}`);
  },
};
