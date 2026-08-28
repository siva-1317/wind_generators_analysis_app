import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number | string;
    isUp?: boolean;
    isGood?: boolean;
  };
  accentColor?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'blue' | 'purple';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'emerald',
}) => {
  const colorMap = {
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-4 md:p-5 relative overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider app-text-muted">{title}</span>
        <div className={`p-2 rounded-xl border ${colorMap[accentColor]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric */}
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl md:text-3xl font-extrabold font-mono app-text-main tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs font-semibold app-text-muted font-sans">{unit}</span>}
      </div>

      {/* Subtitle or Trend Footnote */}
      <div className="flex items-center justify-between text-[11px] app-text-subtle mt-1 font-medium">
        {subtitle && <span>{subtitle}</span>}
        {trend && (
          <div
            className={`flex items-center gap-1 font-bold ${
              trend.isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};
