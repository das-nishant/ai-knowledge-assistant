import { api } from './api';
import type { Document, DocumentStats } from '../types';

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

    // Note: Do NOT manually set 'Content-Type': 'multipart/form-data' in Axios with FormData,
    // so Axios can automatically generate the correct boundary string for FastAPI.
    const response = await api.post<Document>('/documents/upload', formData);
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
