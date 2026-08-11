import { api } from './api';
import type { Document, DocumentStats } from '../types';

export interface DocumentSummary {
  document_id: number;
  filename: string;
  summary: string;
}

export const documentService = {
  async getDocuments(search?: string): Promise<Document[]> {
    const params = search ? { search } : {};
    const response = await api.get<Document[]>('/documents', { params });
    return response.data;
  },

  async getStats(): Promise<DocumentStats> {
    const response = await api.get<DocumentStats>('/documents/stats');
    return response.data;
  },

  async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<Document>('/documents/upload', formData);
    return response.data;
  },

  async generateSummary(documentId: number): Promise<DocumentSummary> {
    const response = await api.post<DocumentSummary>(`/documents/${documentId}/summary`);
    return response.data;
  },

  async deleteDocument(documentId: number): Promise<void> {
    await api.delete(`/documents/${documentId}`);
  },

  async reindexDocument(documentId: number): Promise<Document> {
    const response = await api.post<Document>(`/documents/${documentId}/reindex`);
    return response.data;
  },
};
