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
  X,
  Zap,
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  unacknowledgedAlertsCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  unacknowledgedAlertsCount = 0,
}) => {
  const drawerItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Generators', path: '/generators', icon: Wind },
    { label: 'Live Telemetry', path: '/telemetry', icon: Activity },
    { label: 'Analytics', path: '/analytics', icon: LineChart },
    { label: 'Alerts', path: '/alerts', icon: Bell, badge: unacknowledgedAlertsCount },
    { label: 'AI Insights', path: '/ai-insights', icon: Sparkles },
    { label: 'Settings & ESP32 Hub', path: '/settings', icon: Settings },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const bottomTabItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Fleet', path: '/generators', icon: Wind },
    { label: 'AI Hub', path: '/ai-insights', icon: Sparkles },
    { label: 'Alerts', path: '/alerts', icon: Bell, badge: unacknowledgedAlertsCount },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* 1. Slide-Out Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

          <div className="relative flex-1 max-w-xs w-full app-bg-sidebar border-r app-border p-4 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b app-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-bold app-text-main tracking-tight">WindSense AI</span>
                </div>
                <button onClick={onClose} className="p-1 app-text-muted hover:text-emerald-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {drawerItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'app-text-muted hover:bg-emerald-500/10'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t app-border text-xs app-text-subtle">
              WindSense AI Mobile Interface v1.0
            </div>
          </div>
        </div>
      )}

      {/* 2. Fixed Bottom Tab Bar for Mobile Devices */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 app-bg-header backdrop-blur-md border-t app-border z-40 flex items-center justify-around px-2">
        {bottomTabItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full py-1 text-[11px] font-semibold transition ${
                  isActive ? 'text-emerald-500' : 'app-text-muted hover:text-emerald-500'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
};
