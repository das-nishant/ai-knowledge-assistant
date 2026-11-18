import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut,
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { authService } from '../services/auth';
import { chatService } from '../services/chat';

export const Settings: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const { clearAllConversations } = useChatStore();

  // ── Edit Profile ──────────────────────────────────────────
  const [name, setName] = useState(user?.name || '');
  const [nameStatus, setNameStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [nameMsg, setNameMsg] = useState('');

  const handleSaveName = async () => {
    if (!name.trim() || name.trim() === user?.name) return;
    setNameStatus('saving');
    try {
      const updated = await authService.updateProfile(name.trim());
      updateUser(updated);
      setNameStatus('ok');
      setNameMsg('Name updated successfully.');
    } catch (e: any) {
      setNameStatus('err');
      setNameMsg(e.response?.data?.detail || 'Failed to update name.');
    }
    setTimeout(() => setNameStatus('idle'), 3000);
  };

  // ── Change Password ───────────────────────────────────────
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [pwMsg, setPwMsg] = useState('');

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      setPwStatus('err');
      setPwMsg('Please fill in all password fields.');
      return;
    }
    if (newPw.length < 6) {
      setPwStatus('err');
      setPwMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwStatus('err');
      setPwMsg('New passwords do not match.');
      return;
    }
    setPwStatus('saving');
    try {
      await authService.changePassword(currentPw, newPw);
      setPwStatus('ok');
      setPwMsg('Password changed successfully.');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (e: any) {
      setPwStatus('err');
      setPwMsg(e.response?.data?.detail || 'Failed to change password.');
    }
    setTimeout(() => setPwStatus('idle'), 4000);
  };

  // ── Clear All Conversations ───────────────────────────────
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearStatus, setClearStatus] = useState<'idle' | 'clearing' | 'ok' | 'err'>('idle');
  const [clearMsg, setClearMsg] = useState('');

  const handleClearAll = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setClearStatus('clearing');
    try {
      await chatService.clearAllConversations();
      clearAllConversations();
      setClearStatus('ok');
      setClearMsg('All conversations cleared.');
      setConfirmClear(false);
    } catch (e: any) {
      setClearStatus('err');
      setClearMsg(e.response?.data?.detail || 'Failed to clear conversations.');
    }
    setTimeout(() => setClearStatus('idle'), 3000);
  };

  // ── Shared input style ────────────────────────────────────
  const inputCls =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all';

  const StatusLine = ({ status, msg }: { status: string; msg: string }) =>
    status === 'ok' ? (
      <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
        <CheckCircle2 className="w-3.5 h-3.5" /> {msg}
      </p>
    ) : status === 'err' ? (
      <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
        <XCircle className="w-3.5 h-3.5" /> {msg}
      </p>
    ) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-purple-400" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account and preferences.</p>
      </div>

      {/* ── User Profile Card ──────────────────────────────── */}
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

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
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

      {/* ── Edit Profile ──────────────────────────────────── */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-indigo-400" />
          Edit Profile
        </h3>

        <div className="space-y-3">
          <label className="block text-xs text-slate-400 font-medium">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputCls}
          />
          <StatusLine status={nameStatus} msg={nameMsg} />
          <button
            onClick={handleSaveName}
            disabled={nameStatus === 'saving' || !name.trim() || name.trim() === user?.name}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all"
          >
            {nameStatus === 'saving' ? 'Saving…' : 'Save Name'}
          </button>
        </div>
      </div>

      {/* ── Change Password ───────────────────────────────── */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          Change Password
        </h3>

        <div className="space-y-3">
          {/* Current Password */}
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 6 characters"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowNewPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPw ? 'text' : 'password'}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <StatusLine status={pwStatus} msg={pwMsg} />

          <button
            onClick={handleChangePassword}
            disabled={pwStatus === 'saving'}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all"
          >
            {pwStatus === 'saving' ? 'Changing…' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* ── Danger Zone ───────────────────────────────────── */}
      <div className="glass-panel p-6 rounded-2xl border border-red-500/20 space-y-4">
        <h3 className="font-bold text-red-400 text-base flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>

        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            Permanently delete all your chat history. This action cannot be undone.
          </p>

          {confirmClear && (
            <p className="text-xs text-amber-400 font-medium">
              Are you sure? Click again to confirm and clear everything.
            </p>
          )}

          <StatusLine status={clearStatus} msg={clearMsg} />

          <button
            onClick={handleClearAll}
            disabled={clearStatus === 'clearing'}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              confirmClear
                ? 'bg-red-600 hover:bg-red-500 text-white border-red-500'
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {clearStatus === 'clearing'
              ? 'Clearing…'
              : confirmClear
              ? '⚠ Confirm — Clear All History'
              : 'Clear All Chat History'}
          </button>

          {confirmClear && (
            <button
              onClick={() => setConfirmClear(false)}
              className="ml-3 text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── Sign Out ──────────────────────────────────────── */}
      <div className="pt-1">
        <button
          onClick={logout}
          className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium text-xs flex items-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};
