import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import {
  LayoutDashboard,
  MessageSquarePlus,
  MessageSquare,
  FileText,
  History,
  Settings,
  Trash2,
  Edit2,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const {
    conversations,
    currentConversationId,
    fetchConversations,
    selectConversation,
    startNewChat,
    deleteConversation,
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleNewChat = () => {
    startNewChat();
    navigate('/chat');
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectConv = (id: number) => {
    selectConversation(id);
    navigate('/chat');
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat', label: 'AI Chat', icon: MessageSquare },
    { to: '/documents', label: 'Knowledge Base', icon: FileText },
    { to: '/history', label: 'Chat History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-xl border-r border-white/10 w-64 p-4 text-slate-300">
      {/* Mobile close button */}
      <div className="flex items-center justify-between md:hidden mb-4 pb-2 border-b border-white/10">
        <span className="font-semibold text-white">Menu</span>
        <button onClick={onCloseMobile} className="p-1 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 transition-all glow-btn mb-6"
      >
        <Plus className="w-5 h-5" />
        <span>New Chat</span>
      </button>

      {/* Main Nav Links */}
      <div className="space-y-1 mb-6">
        <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'hover:bg-white/5 hover:text-slate-100 text-slate-400'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Recent Chats Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Recent Chats
          </p>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
            {conversations.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-slate-500 px-3 py-4 text-center italic">
              No conversations yet
            </p>
          ) : (
            conversations.slice(0, 10).map((conv) => {
              const isSelected = currentConversationId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/25'
                      : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-6">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    <span className="truncate">{conv.title || 'New Conversation'}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    title="Delete Chat"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-white/10 mt-auto text-[11px] text-slate-500 flex items-center justify-between">
        <span>Grounded RAG System</span>
        <span className="flex items-center gap-1 text-indigo-400 font-medium">
          <Sparkles className="w-3 h-3" /> Groq AI
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block shrink-0">{content}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-50">{content}</div>
        </div>
      )}
    </>
  );
};
