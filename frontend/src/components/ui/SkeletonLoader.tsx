import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="glass-card rounded-2xl p-5 space-y-3 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-slate-800 rounded w-1/3" />
      <div className="h-5 bg-slate-800 rounded-full w-16" />
    </div>
    <div className="h-8 bg-slate-800/80 rounded w-1/2" />
    <div className="grid grid-cols-4 gap-2 pt-2">
      <div className="h-10 bg-slate-900 rounded" />
      <div className="h-10 bg-slate-900 rounded" />
      <div className="h-10 bg-slate-900 rounded" />
      <div className="h-10 bg-slate-900 rounded" />
    </div>
  </div>
);

export const SkeletonChart: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div
    className="glass-card rounded-2xl p-4 flex items-center justify-center animate-pulse"
    style={{ height }}
  >
    <div className="w-full h-full bg-slate-900/60 rounded-xl flex items-end p-4 gap-2">
      <div className="w-full bg-slate-800/60 rounded-t h-1/3" />
      <div className="w-full bg-slate-800/60 rounded-t h-2/3" />
      <div className="w-full bg-slate-800/60 rounded-t h-1/2" />
      <div className="w-full bg-slate-800/60 rounded-t h-4/5" />
      <div className="w-full bg-slate-800/60 rounded-t h-3/5" />
    </div>
  </div>
);
