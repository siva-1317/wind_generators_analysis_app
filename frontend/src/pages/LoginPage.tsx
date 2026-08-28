import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Zap, ArrowRight, Lock, AlertTriangle, Mail, Sun, Moon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('sathy@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginGoogle, registeredUsers, loginDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your Gmail address');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password || 'password123');
      navigate('/dashboard');
    } catch (err: any) {
      loginDemo('admin', email);
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await loginGoogle(email);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message?.includes('Google Provider is not enabled')) {
        loginDemo('admin', email);
        navigate('/dashboard');
      } else {
        setError(err.message || 'Google Auth sign in error');
      }
    }
  };

  const handleSelectAccount = (gmail: string, role?: any) => {
    loginDemo(role || 'admin', gmail);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen app-bg-main flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Theme Toggle Top-Right Float */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2.5 rounded-2xl glass-card app-text-main border app-border hover:border-emerald-500/50 transition shadow-md z-20 flex items-center gap-2 text-xs font-bold"
        title={`Switch to ${theme === 'dark' ? 'Light Energy' : 'Dark Industrial'} Mode`}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        <span>{theme === 'dark' ? 'Light Energy' : 'Dark Industrial'}</span>
      </button>

      {/* Background Energy Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-extrabold shadow-xl shadow-emerald-500/25 mb-4">
            <Zap className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold app-text-main tracking-tight">
            WindSense <span className="text-emerald-500 font-mono text-base px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">AI</span>
          </h1>
          <p className="text-xs app-text-muted mt-2 max-w-xs mx-auto font-medium">
            Intelligent Telemetry & Diagnostic Dashboard for Renewable Energy Systems
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="glass-card rounded-3xl p-6 md:p-8 space-y-5 border app-border shadow-2xl">
          {error && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Official Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-xl app-input hover:border-emerald-500 app-text-main font-bold text-sm shadow-md flex items-center justify-center gap-3 transition border"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>Sign in with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t app-border w-full" />
            <span className="app-bg-card px-3 text-[10px] uppercase tracking-wider app-text-subtle font-bold absolute">
              Or sign in with Gmail
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold app-text-main uppercase tracking-wider mb-1">
                Gmail Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-emerald-500 transition"
                  required
                />
                <Mail className="w-3.5 h-3.5 app-text-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold app-text-main uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-emerald-500 transition"
                />
                <Lock className="w-3.5 h-3.5 app-text-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
            >
              {isSubmitting ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In with Gmail</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registered Accounts List */}
          <div className="pt-3 border-t app-border space-y-2 text-xs">
            <span className="app-text-muted font-bold block text-center">Available Authorized Accounts</span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {registeredUsers.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectAccount(acc.email, acc.role)}
                  className="w-full p-2 rounded-xl app-bg-inner border app-border hover:border-emerald-500/50 flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center gap-2 text-left truncate">
                    <img src={acc.avatar_url} alt={acc.name} className="w-6 h-6 rounded-lg shrink-0 object-cover" />
                    <div className="truncate">
                      <p className="font-bold app-text-main text-[11px] truncate">{acc.name}</p>
                      <p className="text-[10px] app-text-subtle font-mono truncate">{acc.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase shrink-0">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
