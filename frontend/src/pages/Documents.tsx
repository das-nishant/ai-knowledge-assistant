import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../store/documentStore';
import { useChatStore } from '../store/chatStore';
import {
  FileText,
  Upload,
  Search,
  Trash2,
  RefreshCw,
  MessageSquare,
  HardDrive,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';

export const Documents: React.FC = () => {
  const navigate = useNavigate();
  const {
    documents,
    stats,
    isLoading,
    isUploading,
    error,
    clearError,
    fetchDocuments,
    fetchStats,
    uploadDocument,
    deleteDocument,
    reindexDocument,
  } = useDocumentStore();

  const { setSelectedDocumentId, startNewChat } = useChatStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    fetchDocuments(e.target.value);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      e.target.value = '';
      await uploadDocument(file);
    }
  };

  const handleAskInChat = (documentId: number) => {
    setSelectedDocumentId(documentId);
    startNewChat();
    navigate('/chat');
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Knowledge Base Documents
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage your PDF knowledge base, monitor indexing status, or re-index files.
          </p>
        </div>

        <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs cursor-pointer shadow-lg shadow-indigo-600/30 transition-all glow-btn shrink-0">
          {isUploading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading & Indexing...
            </span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Upload PDF Document</span>
            </>
          )}
          <input
            type="file"
            accept=".pdf"
            disabled={isUploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={clearError} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-medium">Total Files</p>
            <p className="text-lg font-bold text-white">{stats?.total_documents || documents.length}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-medium">Indexed Pages</p>
            <p className="text-lg font-bold text-white">{stats?.total_pages || 0}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-medium">Storage Size</p>
            <p className="text-lg font-bold text-white">{formatBytes(stats?.total_file_size_bytes)}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search documents by filename..."
          className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
        />
      </div>

      {/* Document Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm">No PDF documents found in your knowledge base.</p>
            <p className="text-xs text-slate-500">Upload a PDF to get started with document RAG.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-4">Filename</th>
                  <th className="p-4">Page Count</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Uploaded Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="truncate max-w-xs">{doc.filename}</span>
                    </td>
                    <td className="p-4">{doc.page_count} pages</td>
                    <td className="p-4">{formatBytes(doc.file_size)}</td>
                    <td className="p-4">
                      <span
                        className={`font-semibold px-2.5 py-1 rounded-full text-[10px] border flex items-center gap-1 w-max ${
                          doc.status === 'indexed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : doc.status === 'processing'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {doc.status === 'indexed' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAskInChat(doc.id)}
                          title="Ask in Chat"
                          className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => reindexDocument(doc.id)}
                          title="Re-index into ChromaDB"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(doc.id)}
                          title="Delete document"
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Delete Document</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete this document? This will remove the file from storage and purge all associated vector embeddings from ChromaDB.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteDocument(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-500"
              >
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
