import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDocumentStore } from '../store/documentStore';
import { useChatStore } from '../store/chatStore';
import {
  FileText,
  MessageSquare,
  Upload,
  Sparkles,
  Layers,
  HardDrive,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { documents, stats, fetchDocuments, fetchStats, uploadDocument, isUploading } = useDocumentStore();
  const { conversations, fetchConversations, startNewChat, selectConversation } = useChatStore();

  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
    fetchConversations();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      e.target.value = '';
      await uploadDocument(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadDocument(e.dataTransfer.files[0]);
    }
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
      {/* Welcome Header */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 to-transparent blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Knowledge Assistant
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Hello, {user?.name || 'Researcher'}!
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Your RAG workspace is ready. Ask questions, explore documents, or upload new files.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                startNewChat();
                navigate('/chat');
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all glow-btn"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Documents</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats?.total_documents || documents.length}</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {stats?.indexed_count || 0} Indexed
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Active Conversations</p>
            <h3 className="text-2xl font-bold text-white mt-1">{conversations.length}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Grounded AI history</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Pages</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats?.total_pages || 0}</h3>
            <p className="text-[11px] text-slate-400 mt-1">ChromaDB Chunked</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Storage Usage</p>
            <h3 className="text-2xl font-bold text-white mt-1">{formatBytes(stats?.total_file_size_bytes)}</h3>
            <p className="text-[11px] text-slate-400 mt-1">PDF File Cache</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`glass-panel p-8 rounded-2xl border-2 border-dashed transition-all text-center relative overflow-hidden ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-white/15 hover:border-indigo-500/50 bg-slate-900/40'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Upload Documents to Knowledge Base</h3>
            <p className="text-xs text-slate-400 mt-1">
              Drag & drop your PDF documents here, or click to select files for RAG indexing
            </p>
          </div>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs cursor-pointer shadow-md transition-all">
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Indexing PDF...
              </span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Select PDF File</span>
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
      </div>

      {/* Grid: Recent Documents & Recent Chats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Recent Knowledge Base Uploads
            </h3>
            <button
              onClick={() => navigate('/documents')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {documents.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center italic">
              No documents uploaded yet. Upload a PDF to start asking questions!
            </p>
          ) : (
            <div className="space-y-2">
              {documents.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200 text-xs truncate">{doc.filename}</p>
                      <p className="text-[10px] text-slate-400">
                        {doc.page_count} pages • {formatBytes(doc.file_size)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      doc.status === 'indexed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : doc.status === 'processing'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Chats */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Recent Conversations
            </h3>
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View history <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {conversations.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center italic">
              No conversations yet. Start a new chat to interact with your knowledge base.
            </p>
          ) : (
            <div className="space-y-2">
              {conversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    selectConversation(conv.id);
                    navigate('/chat');
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 cursor-pointer transition-all hover:bg-white/10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200 text-xs truncate">
                        {conv.title || 'New Conversation'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {conv.last_message_preview || 'Click to view conversation'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
