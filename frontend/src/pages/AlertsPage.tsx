import React, { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { useGenerators } from '../hooks/useGenerators';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, acknowledge } = useAlerts();
  const { generators } = useGenerators();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const genMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    generators.forEach((g) => (map[g.id] = g.name));
    return map;
  }, [generators]);

  const filteredAlerts = alerts.filter((a) => {
    const matchSev = filterSeverity === 'all' || a.severity === filterSeverity;
    const matchAck =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !a.acknowledged) ||
      (filterStatus === 'acknowledged' && a.acknowledged);
    return matchSev && matchAck;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Severity Tabs */}
        <div className="flex items-center p-1 rounded-xl app-bg-inner border app-border text-xs">
          {['all', 'info', 'warning', 'critical'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                filterSeverity === sev
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'app-text-muted hover:text-emerald-500'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center p-1 rounded-xl app-bg-inner border app-border text-xs">
          {['all', 'pending', 'acknowledged'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                filterStatus === st
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'app-text-muted hover:text-emerald-500'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List Container */}
      {filteredAlerts.length === 0 ? (
        <EmptyState
          title="No alerts match selected filters"
          description="All monitored wind generators are running within safe parameters or filters are excluding records."
          icon={ShieldCheck}
        />
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const genName = genMap[alert.generator_id] || 'Wind Generator';
            return (
              <div
                key={alert.id}
                className={`glass-card rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 ${
                  alert.severity === 'critical'
                    ? 'border-l-rose-500'
                    : alert.severity === 'warning'
                    ? 'border-l-amber-500'
                    : 'border-l-cyan-500'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={alert.severity} size="sm" />
                    <span className="font-bold text-sm app-text-main">{genName}</span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded app-bg-inner app-text-muted border app-border">
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-xs app-text-main font-semibold leading-relaxed">{alert.message}</p>
                  <p className="text-[11px] app-text-subtle flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </p>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {alert.acknowledged ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold app-bg-inner app-text-muted border app-border">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Acknowledged</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledge(alert.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Acknowledge Alarm</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
