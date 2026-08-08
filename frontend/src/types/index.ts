export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Document {
  id: number;
  filename: string;
  filepath: string;
  file_size: number;
  page_count: number;
  status: 'indexed' | 'processing' | 'failed';
  uploaded_at: string;
}

export interface DocumentStats {
  total_documents: number;
  total_file_size_bytes: number;
  total_pages: number;
  indexed_count: number;
}

export interface CitationSource {
  filename: string;
  page?: number;
  content: string;
}

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: CitationSource[];
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview?: string;
}

export interface ConversationDetail {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
