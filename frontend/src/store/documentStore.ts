import { create } from 'zustand';
import type { Document, DocumentStats } from '../types';
import { documentService } from '../services/documents';

interface DocumentState {
  documents: Document[];
  stats: DocumentStats | null;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  clearError: () => void;
  fetchDocuments: (search?: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  uploadDocument: (file: File) => Promise<Document | null>;
  deleteDocument: (documentId: number) => Promise<boolean>;
  reindexDocument: (documentId: number) => Promise<boolean>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  stats: null,
  isLoading: false,
  isUploading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchDocuments: async (search?: string) => {
    set({ isLoading: true, error: null });
    try {
      const docs = await documentService.getDocuments(search);
      set({ documents: docs, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Failed to fetch documents',
        isLoading: false,
      });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await documentService.getStats();
      set({ stats });
    } catch {
      // ignore
    }
  },

  uploadDocument: async (file: File) => {
    set({ isUploading: true, error: null });
    try {
      const doc = await documentService.uploadDocument(file);
      await get().fetchDocuments();
      await get().fetchStats();
      set({ isUploading: false, error: null });
      return doc;
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      let errorStr = 'Failed to upload document';
      if (typeof detail === 'string') {
        errorStr = detail;
      } else if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
        errorStr = `${detail[0].msg} (${detail[0].loc?.join('.') || 'file'})`;
      }
      set({
        error: errorStr,
        isUploading: false,
      });
      return null;
    }
  },

  deleteDocument: async (documentId: number) => {
    try {
      await documentService.deleteDocument(documentId);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== documentId),
      }));
      await get().fetchStats();
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to delete document' });
      return false;
    }
  },

  reindexDocument: async (documentId: number) => {
    try {
      const updated = await documentService.reindexDocument(documentId);
      set((state) => ({
        documents: state.documents.map((d) => (d.id === documentId ? updated : d)),
      }));
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to reindex document' });
      return false;
    }
  },
}));
