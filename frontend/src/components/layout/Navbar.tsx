import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Bot, LogOut, User as UserIcon, Sparkles, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 border-b border-white/10 bg-slate-900/60 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight flex items-center gap-1.5 text-base">
              AI Knowledge Assistant
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                RAG v1.0
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* System Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Groq Llama 3.1 Ready
        </div>

        {/* User Dropdown / Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-semibold">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden lg:block text-left">
              <p className="font-medium text-slate-200 text-xs leading-tight">{user?.name}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
