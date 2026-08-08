import React from 'react';
import { useAuthStore } from '../store/authStore';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Cpu,
  Database,
  Shield,
  LogOut,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-purple-400" />
          Settings & Account Profile
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          View account credentials, AI system configuration, and vector store parameters.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
              Active Member
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
          <div>
            <p className="text-slate-500 uppercase font-semibold">User ID</p>
            <p className="text-slate-200 font-mono mt-0.5">{user?.id}</p>
          </div>
          <div>
            <p className="text-slate-500 uppercase font-semibold">Member Since</p>
            <p className="text-slate-200 mt-0.5">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}
            </p>
          </div>
        </div>
      </div>

      {/* AI & System Configuration */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          RAG Pipeline & Model Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-indigo-300 font-semibold">
              <span>LLM Engine</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p className="text-white font-medium text-sm">Groq Llama 3.1 (8B Instant)</p>
            <p className="text-slate-400 text-[11px]">Sub-second inference speeds</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-cyan-300 font-semibold">
              <span>Vector Database</span>
              <Database className="w-3.5 h-3.5" />
            </div>
            <p className="text-white font-medium text-sm">ChromaDB Persistent Store</p>
            <p className="text-slate-400 text-[11px]">Per-user scoped similarity retrieval</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-purple-300 font-semibold">
              <span>Embeddings Model</span>
              <Shield className="w-3.5 h-3.5" />
            </div>
            <p className="text-white font-medium text-sm">all-MiniLM-L6-v2</p>
            <p className="text-slate-400 text-[11px]">384-dimensional dense vectors</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-emerald-300 font-semibold">
              <span>Chunking Strategy</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-white font-medium text-sm">Recursive Character Splitter</p>
            <p className="text-slate-400 text-[11px]">Chunk size: 300, Overlap: 50</p>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium text-xs flex items-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
};
