import React, { useState } from 'react';
import { useAuth, RegisteredAccount } from '../contexts/AuthContext';
import { UserPlus, LogOut, Check, Lock, ShieldCheck, Mail, Calendar, Clock, CheckCircle2, UserCheck, Shield, Edit2, Trash2, X, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, registerNewUser, updateUser, deleteUser, registeredUsers, logout } = useAuth();

  // Form State for Adding New User
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'operator' | 'viewer'>('operator');
  const [userCreatedMsg, setUserCreatedMsg] = useState('');

  // Editing User State
  const [editingUser, setEditingUser] = useState<RegisteredAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'operator' | 'viewer'>('operator');
  const [editPassword, setEditPassword] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    registerNewUser({
      email: newEmail,
      password: newPassword || 'password123',
      name: newName,
      role: newRole,
    });

    setUserCreatedMsg(`User account '${newName}' (${newEmail}) created as '${newRole.toUpperCase()}'!`);
    setNewEmail('');
    setNewName('');
    setNewPassword('');
    setTimeout(() => setUserCreatedMsg(''), 4000);
  };

  const startEditUser = (account: RegisteredAccount) => {
    setEditingUser(account);
    setEditName(account.name);
    setEditEmail(account.email);
    setEditRole(account.role);
    setEditPassword(account.password || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editEmail || !editName) return;

    updateUser(editingUser.id, {
      name: editName,
      email: editEmail,
      role: editRole,
      password: editPassword,
    });

    setUserCreatedMsg(`User account '${editName}' updated successfully!`);
    setEditingUser(null);
    setTimeout(() => setUserCreatedMsg(''), 4000);
  };

  const handleDeleteUser = (account: RegisteredAccount) => {
    if (window.confirm(`Are you sure you want to delete user account '${account.name}' (${account.email})?`)) {
      deleteUser(account.id);
      setUserCreatedMsg(`User account '${account.name}' deleted.`);
      setTimeout(() => setUserCreatedMsg(''), 4000);
    }
  };

  const formattedCreated = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Active Account';

  const formattedLastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : 'Current Session Active';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. MAIN GOOGLE OAUTH PROFILE CARD */}
      <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6 border-emerald-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Google Avatar Photo */}
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-extrabold text-3xl shadow-xl shadow-emerald-500/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold app-text-main tracking-tight">
                  {user?.name || 'Google User'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold capitalize">
                  Role: {user?.role || 'admin'}
                </span>
              </div>

              <p className="text-xs app-text-muted flex items-center gap-1.5 font-mono font-semibold">
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                <span>{user?.email || 'user@gmail.com'}</span>
              </p>

              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[11px] font-bold">
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google OAuth 2.0 Single Sign-On</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Verified Email</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ADD NEW USER ACCOUNT CARD */}
      <div className="glass-card rounded-2xl p-6 space-y-5 border-emerald-500/30">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold app-text-main tracking-tight flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-500" />
            Add New Authorized User Account
          </h3>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            RBAC Access Provisioning
          </span>
        </div>

        {userCreatedMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{userCreatedMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block app-text-main font-bold mb-1">Full User Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="John Doe"
              className="w-full p-2.5 rounded-xl border font-semibold focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block app-text-main font-bold mb-1">Gmail / Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="john.doe@gmail.com"
              className="w-full p-2.5 rounded-xl border font-semibold focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block app-text-main font-bold mb-1">Account Password</label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 rounded-xl border font-semibold focus:outline-none focus:border-emerald-500"
                required
              />
              <Lock className="w-4 h-4 app-text-subtle absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block app-text-main font-bold mb-1">Assigned Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border font-bold cursor-pointer focus:outline-none focus:border-emerald-500"
            >
              <option value="admin">Admin (Full Access & Devices)</option>
              <option value="operator">Operator (Telemetry & AI Alarms)</option>
              <option value="viewer">Viewer (Read-Only)</option>
            </select>
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User Account</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. ACTIVE REGISTERED ACCOUNTS LIST WITH EDIT & DELETE OPTIONS */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold app-text-main flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-500" />
          Active Registered Accounts ({registeredUsers.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {registeredUsers.map((u) => (
            <div
              key={u.id}
              className="p-3.5 rounded-xl app-bg-inner border app-border flex items-center justify-between gap-3 shadow-sm hover:border-emerald-500/40 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img src={u.avatar_url} alt={u.name} className="w-9 h-9 rounded-xl object-cover border border-emerald-500/30 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold app-text-main truncate">{u.name}</p>
                  <p className="text-[10px] app-text-muted font-mono truncate">{u.email}</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 capitalize">
                    {u.role}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Edit & Delete */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => startEditUser(u)}
                  className="p-1.5 rounded-lg app-bg-card hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-500 border app-border transition"
                  title="Edit User Account"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteUser(u)}
                  className="p-1.5 rounded-lg app-bg-card hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 border app-border transition"
                  title="Delete User Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT USER MODAL DIALOG */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full space-y-4 border-emerald-500/40 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b app-border">
              <h3 className="text-base font-bold app-text-main flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-500" />
                Edit User Account
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg app-text-muted hover:text-emerald-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block app-text-main font-bold mb-1">Full User Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border font-semibold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block app-text-main font-bold mb-1">Gmail / Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border font-semibold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block app-text-main font-bold mb-1">Assigned Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border font-bold cursor-pointer focus:outline-none focus:border-emerald-500"
                >
                  <option value="admin">Admin (Full Access & Devices)</option>
                  <option value="operator">Operator (Telemetry & AI Alarms)</option>
                  <option value="viewer">Viewer (Read-Only)</option>
                </select>
              </div>

              <div>
                <label className="block app-text-main font-bold mb-1">Update Password (Optional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep existing password"
                  className="w-full p-2.5 rounded-xl border font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t app-border">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold app-bg-inner border app-border app-text-muted hover:app-text-main transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ACCOUNT DETAILS & AUTHENTICATION METADATA GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold app-text-main flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            Identity Metadata
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl app-bg-inner border app-border">
              <span className="app-text-muted font-bold">Provider Source:</span>
              <span className="font-bold app-text-main uppercase font-mono">{user?.provider || 'Google OAuth'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl app-bg-inner border app-border">
              <span className="app-text-muted font-bold">Email Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Verified by Google</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold app-text-main flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-500" />
            Session Activity Log
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl app-bg-inner border app-border">
              <span className="app-text-muted font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                <span>Registered:</span>
              </span>
              <span className="font-bold app-text-main">{formattedCreated}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl app-bg-inner border app-border">
              <span className="app-text-muted font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                <span>Last Session:</span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formattedLastSignIn}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SESSION LOGOUT ACTION */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold app-text-main">Sign Out of Session</h4>
          <p className="text-xs app-text-muted">Terminate active session and return to login screen</p>
        </div>
        <button
          onClick={() => logout()}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition flex items-center gap-1.5 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
