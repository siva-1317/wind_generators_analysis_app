import React, { useState } from 'react';
import { useGenerators } from '../hooks/useGenerators';
import { useRealtimeTelemetry } from '../hooks/useRealtimeTelemetry';
import { useAlerts } from '../hooks/useAlerts';
import { apiService } from '../services/api';
import { KpiCard } from '../components/ui/KpiCard';
import { GeneratorCard } from '../components/ui/GeneratorCard';
import { TelemetryChart } from '../components/ui/TelemetryChart';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AIInsightCard } from '../components/ui/AIInsightCard';
import { SkeletonCard, SkeletonChart } from '../components/ui/SkeletonLoader';
import { AIAnalysis } from '../types';
import { Wind, Zap, Thermometer, AlertTriangle, Sparkles, Activity, RefreshCw } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { generators, isLoading: loadingGen } = useGenerators();
  const { latestMap, telemetryHistory, isConnected } = useRealtimeTelemetry();
  const { alerts } = useAlerts();

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Compute Fleet Statistics
  const totalGenerators = generators.length;
  const onlineCount = generators.filter((g) => g.status === 'online').length;
  const warningCount = generators.filter((g) => g.status === 'warning').length;
  const criticalCount = generators.filter((g) => g.status === 'critical').length;

  let totalPowerW = 0;
  let tempSum = 0;
  let tempCount = 0;

  Object.values(latestMap || {}).forEach((rec) => {
    if (rec) {
      const v = Number(rec.voltage || 0);
      const c = Number(rec.current || 0);
      const p = Number(rec.power || v * c);
      totalPowerW += p;
      if (rec.temperature !== undefined) {
        tempSum += Number(rec.temperature);
        tempCount++;
      }
    }
  });

  const totalPowerKw = (totalPowerW / 1000).toFixed(1);
  const avgTemp = tempCount > 0 ? (tempSum / tempCount).toFixed(1) : '35.4';

  const handleRunFleetAI = async (genId?: string) => {
    const targetId = genId || generators[0]?.id;
    if (!targetId) return;
    setIsAnalyzing(true);
    try {
      const res = await apiService.analyzeGenerator(targetId);
      setAiAnalysis(res);
    } catch (err) {
      console.error('AI fleet analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard
          title="Monitored Fleet"
          value={totalGenerators}
          unit="Turbines"
          subtitle={`${onlineCount} Online • ${warningCount + criticalCount} Issues`}
          icon={Wind}
          accentColor="emerald"
        />
        <KpiCard
          title="Active Power Output"
          value={totalPowerKw}
          unit="kW"
          subtitle="Combined Generation"
          icon={Zap}
          trend={{ value: '+4.2% vs avg', isUp: true, isGood: true }}
          accentColor="cyan"
        />
        <KpiCard
          title="Average Temperature"
          value={avgTemp}
          unit="°C"
          subtitle="Nacelle Thermal Sensor"
          icon={Thermometer}
          accentColor="amber"
        />
        <KpiCard
          title="Active Alarms"
          value={alerts.filter((a) => !a.acknowledged).length}
          unit="Alerts"
          subtitle={`${criticalCount} Critical status`}
          icon={AlertTriangle}
          accentColor={criticalCount > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* 2. System AI Diagnostic Summary Section */}
      <div className="glass-card banner-gradient rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
            <h3 className="text-base font-extrabold app-text-main tracking-tight">WindSense AI Diagnostics</h3>
          </div>
          <p className="text-xs app-text-muted">
            Real-time telemetry pattern analysis powered by Gemini AI engine.
          </p>
        </div>

        <button
          onClick={() => handleRunFleetAI()}
          disabled={isAnalyzing}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 shrink-0"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Telemetry...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Analyze Fleet with AI</span>
            </>
          )}
        </button>
      </div>

      {/* AI Analysis Display if triggered */}
      {aiAnalysis && <AIInsightCard analysis={aiAnalysis} />}

      {/* 3. Live Telemetry Realtime Chart Section */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold app-text-main tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Live Telemetry Stream
            </h3>
            <p className="text-xs app-text-subtle">Multi-parameter real-time sensor waveform</p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded app-bg-inner text-emerald-600 dark:text-emerald-400 border app-border font-bold">
            {isConnected ? 'Realtime 1000ms Stream' : 'Polling Active'}
          </span>
        </div>

        {telemetryHistory.length > 0 ? (
          <TelemetryChart data={telemetryHistory} metrics={['temperature', 'voltage', 'power']} height={300} />
        ) : (
          <SkeletonChart height={300} />
        )}
      </div>

      {/* 4. Wind Generator Overview Fleet Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold app-text-main tracking-tight">Generator Fleet Status</h3>
          <span className="text-xs app-text-muted font-mono font-semibold">{generators.length} Turbines Configured</span>
        </div>

        {loadingGen ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generators.map((gen) => (
              <GeneratorCard
                key={gen.id}
                generator={gen}
                telemetry={latestMap[gen.id]}
                onAnalyzeAI={(id) => handleRunFleetAI(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Active Alerts Feed */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="text-base font-bold app-text-main tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Recent Active Alarms
        </h3>
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded-xl app-bg-inner border app-border flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <StatusBadge status={alert.severity} size="sm" />
                <div>
                  <p className="font-bold app-text-main">{alert.message}</p>
                  <p className="text-[10px] app-text-subtle">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono app-text-muted font-semibold">
                {alert.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
