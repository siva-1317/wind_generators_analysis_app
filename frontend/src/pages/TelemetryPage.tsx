import React, { useState } from 'react';
import { useGenerators } from '../hooks/useGenerators';
import { useRealtimeTelemetry } from '../hooks/useRealtimeTelemetry';
import { TelemetryChart } from '../components/ui/TelemetryChart';
import { SkeletonChart } from '../components/ui/SkeletonLoader';
import { Download, Filter, Activity, RefreshCw } from 'lucide-react';

export const TelemetryPage: React.FC = () => {
  const { generators } = useGenerators();
  const [selectedGenId, setSelectedGenId] = useState<string>('');

  const activeGenId = selectedGenId || generators[0]?.id;
  const { telemetryHistory, isLoading, refetch } = useRealtimeTelemetry(activeGenId);

  const [activeMetrics, setActiveMetrics] = useState<
    ('temperature' | 'humidity' | 'voltage' | 'current' | 'power' | 'rpm')[]
  >(['temperature', 'voltage', 'current', 'power']);

  const toggleMetric = (metric: 'temperature' | 'humidity' | 'voltage' | 'current' | 'power' | 'rpm') => {
    setActiveMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  };

  const exportCSV = () => {
    if (telemetryHistory.length === 0) return;
    const headers = ['Timestamp', 'Generator ID', 'Temp (°C)', 'Humidity (%)', 'Voltage (V)', 'Current (A)', 'Power (W)', 'RPM'];
    const rows = telemetryHistory.map((t) => [
      t.timestamp,
      t.generator_id,
      t.temperature,
      t.humidity,
      t.voltage,
      t.current,
      t.power,
      t.rpm,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `windsense_telemetry_${activeGenId || 'all'}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Generator Selector + Metrics + Export */}
      <div className="glass-card rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Generator Dropdown */}
          <div className="flex items-center gap-2 app-bg-inner border app-border rounded-xl px-3 py-1.5 text-xs app-text-muted">
            <Filter className="w-3.5 h-3.5 app-text-subtle" />
            <span className="font-bold">Turbine:</span>
            <select
              value={selectedGenId}
              onChange={(e) => setSelectedGenId(e.target.value)}
              className="bg-transparent app-text-main font-bold focus:outline-none cursor-pointer"
            >
              {generators.map((g) => (
                <option key={g.id} value={g.id} className="app-text-main app-bg-card">
                  {g.name} ({g.device_id})
                </option>
              ))}
            </select>
          </div>

          {/* Metric Selector Checkboxes */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl app-bg-inner border app-border text-[11px]">
            {(
              [
                { key: 'temperature', label: 'Temp', color: 'text-orange-500 font-bold' },
                { key: 'voltage', label: 'Volt', color: 'text-blue-500 font-bold' },
                { key: 'current', label: 'Curr', color: 'text-purple-500 font-bold' },
                { key: 'power', label: 'Power', color: 'text-emerald-500 font-bold' },
                { key: 'rpm', label: 'RPM', color: 'text-amber-500 font-bold' },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeMetrics.includes(m.key)
                    ? 'app-bg-card app-text-main border app-border shadow-sm'
                    : 'app-text-subtle hover:app-text-main'
                }`}
              >
                <span className={m.color}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl app-bg-inner border app-border app-text-muted hover:text-emerald-500 transition"
            title="Refresh stream"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Chart Visualization */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="text-base font-bold app-text-main tracking-tight flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          Historical Waveform Inspector
        </h3>
        {isLoading ? (
          <SkeletonChart height={340} />
        ) : (
          <TelemetryChart data={telemetryHistory} metrics={activeMetrics} height={340} />
        )}
      </div>

      {/* Raw Data Table */}
      <div className="glass-card rounded-2xl p-5 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold app-text-main tracking-tight">Raw Sensor Data Logs</h3>
          <span className="text-xs font-mono app-text-muted font-semibold">{telemetryHistory.length} Packets Received</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b app-border app-text-muted font-bold uppercase tracking-wider app-bg-inner">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Temp (°C)</th>
                <th className="py-3 px-4">Humidity (%)</th>
                <th className="py-3 px-4">Voltage (V)</th>
                <th className="py-3 px-4">Current (A)</th>
                <th className="py-3 px-4">Power (W)</th>
                <th className="py-3 px-4">Rotor RPM</th>
              </tr>
            </thead>
            <tbody className="divide-y app-border font-mono app-text-main">
              {telemetryHistory.slice().reverse().map((rec) => (
                <tr key={rec.id} className="hover:bg-emerald-500/5 transition">
                  <td className="py-3 px-4 app-text-muted font-sans font-medium">
                    {new Date(rec.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-orange-500 font-bold">{rec.temperature}</td>
                  <td className="py-3 px-4 text-cyan-500 font-bold">{rec.humidity}</td>
                  <td className="py-3 px-4 text-blue-500 font-bold">{rec.voltage}</td>
                  <td className="py-3 px-4 text-purple-500 font-bold">{rec.current}</td>
                  <td className="py-3 px-4 text-emerald-500 font-bold">{rec.power}</td>
                  <td className="py-3 px-4 text-amber-500 font-bold">{rec.rpm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
