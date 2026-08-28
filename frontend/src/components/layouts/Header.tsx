import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { WindGenerator } from '../../types';
import { Menu, Bell, Wifi, WifiOff, User as UserIcon, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onToggleMobileNav: () => void;
  generators?: WindGenerator[];
  selectedGeneratorId?: string;
  onSelectGenerator?: (id: string) => void;
  unacknowledgedAlertsCount?: number;
  isConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileNav,
  generators = [],
  selectedGeneratorId = '',
  onSelectGenerator,
  unacknowledgedAlertsCount = 0,
  isConnected = true,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/generators/')) return 'Generator Detail Diagnostics';
    switch (pathname) {
      case '/dashboard':
        return 'System Overview & Live Dashboard';
      case '/generators':
        return 'Wind Generator Fleet';
      case '/telemetry':
        return 'Telemetry Explorer & Raw Logs';
      case '/analytics':
        return 'Performance Analytics & Trends';
      case '/alerts':
        return 'Centralized Alert Center';
      case '/ai-insights':
        return 'WindSense AI Intelligence Hub';
      case '/settings':
        return 'System Configuration & ESP32 Hub';
      case '/profile':
        return 'User Profile & Google OAuth Account';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="h-16 px-4 md:px-6 app-bg-header backdrop-blur-md border-b app-border flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      {/* Left: Mobile Nav Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-2 rounded-lg app-bg-inner app-text-muted hover:text-emerald-500"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base md:text-lg font-bold app-text-main tracking-tight">
            {getPageTitle(location.pathname)}
          </h2>
          <p className="text-[11px] app-text-subtle hidden sm:block font-medium">Real-time IoT Wind Turbine Telemetry</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl app-input border hover:border-emerald-500/50 transition shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light Energy' : 'Dark Industrial'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* Generator Selector */}
        {onSelectGenerator && generators.length > 0 && (
          <div className="relative hidden sm:block">
            <select
              value={selectedGeneratorId}
              onChange={(e) => onSelectGenerator(e.target.value)}
              className="appearance-none app-input text-xs rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer shadow-sm"
            >
              <option value="">All Wind Generators</option>
              {generators.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.device_id})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 app-text-subtle absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Stream Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
          }`}
        >
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Live Stream</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-rose-500" />
              <span className="hidden sm:inline">Reconnecting</span>
            </>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-xl app-input border hover:border-emerald-500/50 transition shadow-sm"
          aria-label="View alerts"
        >
          <Bell className="w-4 h-4 app-text-muted" />
          {unacknowledgedAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
              {unacknowledgedAlertsCount}
            </span>
          )}
        </button>

        {/* Google User Profile Pill */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 pl-2 border-l app-border cursor-pointer hover:opacity-90 transition"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-8 h-8 rounded-xl object-cover border border-emerald-500/40 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl app-bg-inner border app-border flex items-center justify-center text-emerald-500 font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
          )}
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold app-text-main leading-tight line-clamp-1">{user?.name || 'Google User'}</p>
            <p className="text-[10px] text-emerald-500 font-mono capitalize font-bold">{user?.role || 'admin'}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="p-1.5 app-text-subtle hover:text-rose-500 transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
