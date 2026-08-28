import React from 'react';
import { GeneratorStatus, AlertSeverity, HealthStatus } from '../../types';
import { CheckCircle2, AlertTriangle, AlertOctagon, XCircle, Info } from 'lucide-react';

interface StatusBadgeProps {
  status?: GeneratorStatus | AlertSeverity | HealthStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'online', size = 'md' }) => {
  const normalized = String(status).toLowerCase();

  let bgColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  let Icon = Info;
  let label = status;

  if (normalized === 'online' || normalized === 'optimal') {
    bgColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30';
    Icon = CheckCircle2;
    label = normalized === 'online' ? 'Online' : 'Optimal';
  } else if (normalized === 'warning' || normalized === 'degraded' || normalized === 'attention required') {
    bgColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border-amber-300 dark:border-amber-500/30';
    Icon = AlertTriangle;
    label = normalized === 'warning' ? 'Warning' : normalized === 'degraded' ? 'Degraded' : 'Attention Required';
  } else if (normalized === 'critical' || normalized === 'critical failure risk') {
    bgColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border-rose-300 dark:border-rose-500/30';
    Icon = AlertOctagon;
    label = normalized === 'critical' ? 'Critical' : 'Critical Failure Risk';
  } else if (normalized === 'offline') {
    bgColor = 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-300 dark:border-slate-800';
    Icon = XCircle;
    label = 'Offline';
  } else if (normalized === 'info') {
    bgColor = 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/30';
    Icon = Info;
    label = 'Info';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold border ${bgColor} ${sizeClasses} shadow-sm`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span className="capitalize">{label}</span>
    </span>
  );
};
