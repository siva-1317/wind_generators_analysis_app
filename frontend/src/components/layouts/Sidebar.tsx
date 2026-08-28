import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wind,
  Activity,
  LineChart,
  Bell,
  Sparkles,
  Settings,
  User,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  unacknowledgedAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ unacknowledgedAlertsCount = 0 }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Generators', path: '/generators', icon: Wind },
    { label: 'Live Telemetry', path: '/telemetry', icon: Activity },
    { label: 'Analytics', path: '/analytics', icon: LineChart },
    {
      label: 'Alerts',
      path: '/alerts',
      icon: Bell,
      badge: unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : null,
      badgeColor: 'bg-rose-500',
    },
    { label: 'AI Insights', path: '/ai-insights', icon: Sparkles, highlight: true },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 app-bg-sidebar app-border border-r shrink-0 select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b app-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
          <Zap className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight app-text-main flex items-center gap-1.5">
            WindSense <span className="text-emerald-500 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">AI</span>
          </h1>
          <p className="text-[10px] app-text-subtle tracking-wider uppercase font-semibold">Telemetry Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'app-text-muted hover:text-emerald-500 hover:bg-emerald-500/10'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${item.highlight ? 'text-emerald-500' : ''}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footnote */}
      <div className="p-4 border-t app-border">
        <div className="p-3 rounded-xl app-bg-inner app-border border flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div className="text-xs">
            <p className="font-semibold app-text-main">Live</p>
            <p className="text-[10px] app-text-subtle">Telemetry Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
