import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import {
  History as HistoryIcon,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Clock,
  ArrowRight,
  MessageSquarePlus,
} from 'lucide-react';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const {
    conversations,
    isLoadingConversations,
    fetchConversations,
    selectConversation,
    startNewChat,
    renameConversation,
    deleteConversation,
  } = useChatStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((c) =>
    (c.title || 'New Conversation').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id: number) => {
    selectConversation(id);
    navigate('/chat');
  };

  const handleSaveRename = (id: number) => {
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleClearAll = async () => {
    for (const c of conversations) {
      await deleteConversation(c.id);
    }
    setConfirmClearAll(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-cyan-400" />
            Conversation History
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Review past RAG interactions, export chats, or manage titles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {conversations.length > 0 && (
            <button
              onClick={() => setConfirmClearAll(true)}
              className="px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium text-xs flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}

          <button
            onClick={() => {
              startNewChat();
              navigate('/chat');
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all glow-btn shrink-0"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>New AI Conversation</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search conversation history by title..."
          className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
        />
      </div>

      {/* Conversation List Grid */}
      {isLoadingConversations ? (
        <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          Loading chat history...
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center text-slate-400 space-y-3">
          <MessageSquare className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm">No conversation history found.</p>
          <p className="text-xs text-slate-500">Start a chat to save answers grounded in your documents.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-4 group relative"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>

                    {editingId === conv.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveRename(conv.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(conv.id)}
                        autoFocus
                        className="bg-slate-800 border border-indigo-500 text-white text-xs px-2 py-1 rounded w-full"
                      />
                    ) : (
                      <h3 className="font-bold text-white text-sm truncate">
                        {conv.title || 'New Conversation'}
                      </h3>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(conv.id);
                        setEditTitle(conv.title || '');
                      }}
                      title="Rename"
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteConversation(conv.id)}
                      title="Delete"
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {conv.last_message_preview || 'No messages in this chat.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(conv.updated_at).toLocaleDateString()}
                </span>

                <button
                  onClick={() => handleSelect(conv.id)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  Resume <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {confirmClearAll && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Clear All Chat History</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete all saved conversations? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-500"
              >
                Clear All History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
