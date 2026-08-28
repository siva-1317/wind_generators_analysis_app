import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="glass-card rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
