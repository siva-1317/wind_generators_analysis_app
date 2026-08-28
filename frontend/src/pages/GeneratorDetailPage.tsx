import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useRealtimeTelemetry } from '../hooks/useRealtimeTelemetry';
import { useAlerts } from '../hooks/useAlerts';
import { WindGenerator, AIAnalysis } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TelemetryChart } from '../components/ui/TelemetryChart';
import { AIInsightCard } from '../components/ui/AIInsightCard';
import { KpiCard } from '../components/ui/KpiCard';
import { SkeletonCard, SkeletonChart } from '../components/ui/SkeletonLoader';
import {
  Thermometer,
  Gauge,
  Activity,
  Zap,
  Sparkles,
  MapPin,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const GeneratorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [generator, setGenerator] = useState<WindGenerator | null>(null);
  const [isLoadingGen, setIsLoadingGen] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const { telemetryHistory, isLoading: loadingTelemetry } = useRealtimeTelemetry(id);
  const { alerts } = useAlerts();

  useEffect(() => {
    if (id) {
      setIsLoadingGen(true);
      apiService
        .getGeneratorById(id)
        .then((gen) => setGenerator(gen))
        .catch((err) => console.error('Failed to load generator detail:', err))
        .finally(() => setIsLoadingGen(false));

      apiService
        .getAIAnalyses(id)
        .then((res) => {
          if (res && res.length > 0) setAiAnalysis(res[0]);
        })
        .catch((err) => console.error('Failed to load previous AI analyses:', err));
    }
  }, [id]);

  const handleRunAI = async () => {
    if (!id) return;
    setIsAnalyzing(true);
    try {
      const result = await apiService.analyzeGenerator(id);
      setAiAnalysis(result);
    } catch (err: any) {
      console.error('AI Analysis execution error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const latestRec = telemetryHistory[telemetryHistory.length - 1] || {
    temperature: 34.6,
    humidity: 45.0,
    voltage: 228.9,
    current: 16.1,
    power: 3685.0,
    rpm: 1167,
  };

  const generatorAlerts = alerts.filter((a) => a.generator_id === id);

  if (isLoadingGen) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonChart height={350} />
      </div>
    );
  }

  if (!generator) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-4">
        <h3 className="text-lg font-bold app-text-main">Generator Not Found</h3>
        <button
          onClick={() => navigate('/generators')}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          Return to Generator Fleet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/generators')}
            className="p-2 rounded-xl app-bg-inner border app-border app-text-muted hover:text-emerald-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold app-text-main tracking-tight">{generator.name}</h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded app-bg-inner app-text-muted border app-border">
                {generator.device_id}
              </span>
              <StatusBadge status={generator.status} size="sm" />
            </div>
            <p className="text-xs app-text-muted flex items-center gap-2 mt-0.5 font-medium">
              <MapPin className="w-3.5 h-3.5 app-text-subtle" />
              <span>{generator.location}</span>
              <span>•</span>
              <span>Rated Capacity: {generator.rated_power_kw} kW</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAI}
          disabled={isAnalyzing}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running Gemini Analysis...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Run AI Diagnostics</span>
            </>
          )}
        </button>
      </div>

      {/* Live Telemetry Sensor KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard
          title="Stator Temperature"
          value={latestRec.temperature}
          unit="°C"
          subtitle="Nacelle Temp Sensor"
          icon={Thermometer}
          accentColor={latestRec.temperature > 60 ? 'amber' : 'emerald'}
        />
        <KpiCard
          title="Grid Output Voltage"
          value={latestRec.voltage}
          unit="V"
          subtitle="Nominal 230V RMS"
          icon={Gauge}
          accentColor={latestRec.voltage < 180 ? 'rose' : 'blue'}
        />
        <KpiCard
          title="Current Generation"
          value={latestRec.current}
          unit="A"
          subtitle="Armature Winding Current"
          icon={Activity}
          accentColor="purple"
        />
        <KpiCard
          title="Generated Active Power"
          value={(latestRec.power / 1000).toFixed(1)}
          unit="kW"
          subtitle={`Rotor Speed ${latestRec.rpm} RPM`}
          icon={Zap}
          accentColor="emerald"
        />
      </div>

      {/* Interactive Telemetry Chart Section */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold app-text-main tracking-tight">Realtime Waveform & History</h3>
            <p className="text-xs app-text-subtle">Streamed parameters from ESP32 telemetry module</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center p-1 rounded-xl app-bg-inner border app-border text-xs">
            {(['1h', '6h', '24h', '7d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg font-bold uppercase transition ${
                  timeRange === r
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'app-text-muted hover:text-emerald-500'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {loadingTelemetry ? (
          <SkeletonChart height={320} />
        ) : (
          <TelemetryChart
            data={telemetryHistory}
            metrics={['temperature', 'voltage', 'current', 'power']}
            height={320}
          />
        )}
      </div>

      {/* Gemini AI Diagnostic Result Card */}
      {aiAnalysis ? (
        <AIInsightCard analysis={aiAnalysis} />
      ) : (
        <div className="glass-card rounded-2xl p-6 text-center space-y-3">
          <Sparkles className="w-6 h-6 text-emerald-500 mx-auto animate-pulse" />
          <h3 className="text-sm font-bold app-text-main">AI Diagnostics Ready</h3>
          <p className="text-xs app-text-muted max-w-sm mx-auto">
            Click <strong>"Run AI Diagnostics"</strong> at the top right to generate a real-time sensor diagnostic report for {generator.name}.
          </p>
        </div>
      )}

      {/* Generator Alerts History */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="text-base font-bold app-text-main tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Turbine Alarms & Logs ({generatorAlerts.length})
        </h3>
        {generatorAlerts.length === 0 ? (
          <p className="text-xs app-text-subtle py-2 font-medium">No active or historical alerts logged for this turbine.</p>
        ) : (
          <div className="space-y-2">
            {generatorAlerts.map((alt) => (
              <div
                key={alt.id}
                className="p-3 rounded-xl app-bg-inner border app-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={alt.severity} size="sm" />
                  <div>
                    <p className="font-bold app-text-main">{alt.message}</p>
                    <p className="text-[10px] app-text-subtle">{new Date(alt.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <span className="font-mono text-[11px] app-text-muted font-semibold">
                  {alt.acknowledged ? 'Acknowledged' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
