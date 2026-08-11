import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';

import { useChatStore } from '../store/chatStore';
import { useDocumentStore } from '../store/documentStore';
import type { CitationSource } from '../types';
import {
  Send,
  Bot,
  User as UserIcon,
  FileText,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  Edit2,
  Plus,
  Download,
  Layers,
  X,
  RotateCcw,
} from 'lucide-react';

export const Chat: React.FC = () => {
  const {
    messages,
    currentTitle,
    currentConversationId,
    selectedDocumentId,
    isSending,
    setSelectedDocumentId,
    sendMessage,
    startNewChat,
    renameConversation,
  } = useChatStore();

  const { documents, fetchDocuments } = useDocumentStore();

  const [inputPrompt, setInputPrompt] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeCitation, setActiveCitation] = useState<CitationSource | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isSending) return;

    const prompt = inputPrompt;
    setInputPrompt('');
    await sendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, msgId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveTitle = () => {
    if (currentConversationId && newTitle.trim()) {
      renameConversation(currentConversationId, newTitle.trim());
      setIsRenaming(false);
    }
  };

  const exportChatToMarkdown = () => {
    if (messages.length === 0) return;
    let mdContent = `# AI Knowledge Assistant Chat Export\n**Title:** ${currentTitle || 'Conversation'}\n**Date:** ${new Date().toLocaleString()}\n\n---\n\n`;
    messages.forEach((msg) => {
      const role = msg.role === 'user' ? '👤 User' : '🤖 AI Assistant';
      mdContent += `### ${role}\n${msg.content}\n\n`;
      if (msg.sources && msg.sources.length > 0) {
        mdContent += `*Sources Cited:*\n`;
        msg.sources.forEach((src) => {
          mdContent += `- ${src.filename} (Page ${src.page || 'N/A'})\n`;
        });
        mdContent += `\n`;
      }
      mdContent += `---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(currentTitle || 'chat_export').replace(/[^a-z0-9]/gi, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerateLast = () => {
    if (messages.length >= 2) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMsg) {
        sendMessage(lastUserMsg.content);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col glass-panel rounded-2xl border border-white/10 overflow-hidden relative">
      {/* Header Bar */}
      <div className="px-6 py-3.5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>

          {isRenaming ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-slate-800 border border-indigo-500/50 text-white text-xs px-2 py-1 rounded focus:outline-none"
              />
              <button
                onClick={handleSaveTitle}
                className="text-xs bg-indigo-600 px-2 py-1 rounded text-white font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setIsRenaming(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 truncate">
              <h2 className="font-bold text-white text-sm truncate">
                {currentTitle || 'New Conversation'}
              </h2>
              {currentConversationId && (
                <button
                  onClick={() => {
                    setNewTitle(currentTitle || '');
                    setIsRenaming(true);
                  }}
                  className="text-slate-500 hover:text-slate-300 p-1"
                  title="Rename Title"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Document Scope Filter Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-slate-800/80 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline text-slate-400">Context:</span>
            <select
              value={selectedDocumentId || ''}
              onChange={(e) =>
                setSelectedDocumentId(e.target.value ? Number(e.target.value) : null)
              }
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="" className="bg-slate-900 text-white">
                All Knowledge Base PDFs
              </option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id} className="bg-slate-900 text-white">
                  📄 {doc.filename}
                </option>
              ))}
            </select>
          </div>

          {messages.length > 0 && (
            <button
              onClick={exportChatToMarkdown}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center gap-1 text-xs"
              title="Export Conversation to Markdown (.md)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </button>
          )}

          <button
            onClick={startNewChat}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/20">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Grounded AI Knowledge Assistant</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ask any question based on your uploaded PDFs. Responses are retrieved directly from ChromaDB vector search with exact source page citations.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 w-full pt-4">
              {[
                'Summarize the core topics in my uploaded documents.',
                'What are the key takeaways from page 1?',
                'Explain concepts mentioned in the PDF.',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputPrompt(suggestion);
                  }}
                  className="p-3 text-left rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/40 hover:bg-white/10 transition-all text-xs text-slate-300 flex items-center justify-between group"
                >
                  <span>"{suggestion}"</span>
                  <Send className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex gap-3 md:gap-4 max-w-4xl mx-auto ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              )}

              <div
                className={`group relative rounded-2xl p-4 text-sm max-w-[85%] md:max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900/90 border border-white/10 text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                {/* Content */}
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none space-y-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {msg.content}
                    </ReactMarkdown>

                    {/* Citation Cards / Badges */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-indigo-400" />
                          Retrieved Sources ({msg.sources.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((src, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => setActiveCitation(src)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{src.filename}</span>
                              {src.page && (
                                <span className="text-[10px] bg-indigo-500/30 px-1 rounded text-white">
                                  p.{src.page}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Response Controls */}
                {msg.role === 'assistant' && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index === messages.length - 1 && (
                      <button
                        onClick={handleRegenerateLast}
                        className="p-1 text-slate-500 hover:text-slate-300"
                        title="Regenerate answer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="p-1 text-slate-500 hover:text-slate-300"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                  <UserIcon className="w-4.5 h-4.5" />
                </div>
              )}
            </div>
          ))
        )}

        {isSending && (
          <div className="flex gap-4 max-w-4xl mx-auto items-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-white/10 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              Retrieving relevant vectors & generating response...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <div className="p-4 border-t border-white/10 bg-slate-900/90 shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2">
          <div className="relative flex-1 bg-slate-900 border border-white/15 rounded-2xl focus-within:border-indigo-500 transition-colors shadow-inner">
            <textarea
              rows={1}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your knowledge base... (Press Enter to send)"
              className="w-full px-4 py-3 rounded-2xl bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none resize-none max-h-32 min-h-[48px]"
            />
          </div>

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isSending}
            className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex items-center justify-center glow-btn disabled:opacity-40 transition-all shrink-0 shadow-lg shadow-indigo-600/30"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Source Citation Modal / Drawer */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-white/10 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-indigo-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold text-white text-base truncate">{activeCitation.filename}</h3>
              </div>
              <button
                onClick={() => setActiveCitation(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Page: {activeCitation.page || 'N/A'}</span>
                <span className="text-emerald-400 font-medium">ChromaDB Chunk Snippet</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap">
                {activeCitation.content}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeCitation.content);
                  alert('Source snippet copied!');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Snippet</span>
              </button>

              <button
                onClick={() => setActiveCitation(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
