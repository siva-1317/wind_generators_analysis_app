import React from 'react';
import { AIAnalysis } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Sparkles, CheckCircle, Lightbulb, Activity, Clock } from 'lucide-react';

interface AIInsightCardProps {
  analysis: AIAnalysis;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ analysis }) => {
  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 space-y-5 border-emerald-500/30 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b app-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-base font-bold app-text-main tracking-tight flex items-center gap-2">
              Gemini AI Diagnostic Report
              {analysis.generatorName && (
                <span className="text-xs app-text-muted font-semibold">({analysis.generatorName})</span>
              )}
            </h3>
            <p className="text-[11px] app-text-subtle flex items-center gap-1 mt-0.5 font-medium">
              <Clock className="w-3 h-3 app-text-subtle" />
              <span>Generated {new Date(analysis.createdAt).toLocaleString()}</span>
            </p>
          </div>
        </div>

        <StatusBadge status={analysis.healthStatus} size="lg" />
      </div>

      {/* Executive Summary */}
      <div className="p-4 rounded-xl app-bg-inner border app-border">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
          Executive Health Summary
        </h4>
        <p className="text-sm app-text-main leading-relaxed font-medium">{analysis.summary}</p>
      </div>

      {/* Insights & Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Performance Insights */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Performance Insights</span>
          </h4>
          <ul className="space-y-1.5">
            {analysis.performanceInsights.map((insight, idx) => (
              <li key={idx} className="text-xs app-text-main flex items-start gap-2 app-bg-inner p-2.5 rounded-lg border app-border font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Maintenance Recommendations */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Actionable Recommendations</span>
          </h4>
          <ul className="space-y-1.5">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs app-text-main flex items-start gap-2 app-bg-inner p-2.5 rounded-lg border app-border font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Telemetry Snapshot Pills */}
      {analysis.telemetrySnapshot && (
        <div className="pt-3 border-t app-border flex flex-wrap items-center gap-3 text-xs app-text-muted">
          <span className="font-bold app-text-main">Analyzed Snapshot:</span>
          <span className="px-2 py-0.5 rounded app-bg-inner border app-border font-mono font-semibold">
            {analysis.telemetrySnapshot.temperature}°C Temp
          </span>
          <span className="px-2 py-0.5 rounded app-bg-inner border app-border font-mono font-semibold">
            {analysis.telemetrySnapshot.voltage}V Volt
          </span>
          <span className="px-2 py-0.5 rounded app-bg-inner border app-border font-mono font-semibold">
            {analysis.telemetrySnapshot.current}A Curr
          </span>
          <span className="px-2 py-0.5 rounded app-bg-inner border app-border font-mono font-semibold">
            {(analysis.telemetrySnapshot.power / 1000).toFixed(1)}kW Power
          </span>
        </div>
      )}
    </div>
  );
};
