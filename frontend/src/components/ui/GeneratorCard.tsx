import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WindGenerator, TelemetryRecord } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Thermometer, Gauge, Zap, Activity, MapPin, Sparkles, ChevronRight } from 'lucide-react';

interface GeneratorCardProps {
  generator: WindGenerator;
  telemetry?: TelemetryRecord;
  onAnalyzeAI?: (generatorId: string) => void;
}

export const GeneratorCard: React.FC<GeneratorCardProps> = ({
  generator,
  telemetry,
  onAnalyzeAI,
}) => {
  const navigate = useNavigate();

  const temp = telemetry ? telemetry.temperature : 35.0;
  const volt = telemetry ? telemetry.voltage : 230.0;
  const curr = telemetry ? telemetry.current : 18.0;
  const powerKw = telemetry ? (telemetry.power / 1000).toFixed(1) : ((volt * curr) / 1000).toFixed(1);

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between space-y-4">
      {/* Top Bar: Name + Device ID + Status */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold app-text-main tracking-tight">{generator.name}</h3>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded app-bg-inner app-text-muted border app-border">
              {generator.device_id}
            </span>
          </div>
          <p className="text-xs app-text-muted flex items-center gap-1 mt-1 font-medium">
            <MapPin className="w-3 h-3 app-text-subtle" />
            <span>{generator.location}</span>
          </p>
        </div>
        <StatusBadge status={generator.status} size="sm" />
      </div>

      {/* Live Sensor Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 app-bg-inner rounded-xl p-3 border app-border">
        <div>
          <div className="flex items-center gap-1 text-[10px] app-text-muted uppercase font-bold">
            <Thermometer className="w-3 h-3 text-orange-500" />
            <span>Temp</span>
          </div>
          <p className="text-sm font-bold font-mono text-orange-600 dark:text-orange-400 mt-0.5">{temp}°C</p>
        </div>

        <div>
          <div className="flex items-center gap-1 text-[10px] app-text-muted uppercase font-bold">
            <Gauge className="w-3 h-3 text-blue-500" />
            <span>Voltage</span>
          </div>
          <p className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">{volt}V</p>
        </div>

        <div>
          <div className="flex items-center gap-1 text-[10px] app-text-muted uppercase font-bold">
            <Activity className="w-3 h-3 text-purple-500" />
            <span>Current</span>
          </div>
          <p className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">{curr}A</p>
        </div>

        <div>
          <div className="flex items-center gap-1 text-[10px] app-text-muted uppercase font-bold">
            <Zap className="w-3 h-3 text-emerald-500" />
            <span>Power</span>
          </div>
          <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{powerKw} kW</p>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-between pt-2 border-t app-border">
        <button
          onClick={() => onAnalyzeAI && onAnalyzeAI(generator.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Run AI Diagnosis</span>
        </button>

        <button
          onClick={() => navigate(`/generators/${generator.id}`)}
          className="flex items-center gap-1 text-xs font-bold app-text-muted hover:text-emerald-500 transition"
        >
          <span>View Telemetry</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
