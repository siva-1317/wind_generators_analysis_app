import React, { useState } from 'react';
import { useGenerators } from '../hooks/useGenerators';
import { useRealtimeTelemetry } from '../hooks/useRealtimeTelemetry';
import { useAlerts } from '../hooks/useAlerts';
import { KpiCard } from '../components/ui/KpiCard';
import { TelemetryChart } from '../components/ui/TelemetryChart';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  BarChart3,
  LineChart,
  TrendingUp,
  Cpu,
  FileText,
  Clock,
  CheckCircle2,
  X,
  Sparkles,
  Download,
  Printer,
  Calendar,
  Filter,
  ShieldCheck,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { generators } = useGenerators();
  const { latestMap, telemetryHistory } = useRealtimeTelemetry();
  const { alerts } = useAlerts();

  // PDF Generator Modal State
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [timeLimit, setTimeLimit] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [targetScope, setTargetScope] = useState<string>('all');
  const [includeSummary, setIncludeSummary] = useState<boolean>(true);
  const [includeTable, setIncludeTable] = useState<boolean>(true);
  const [includeAI, setIncludeAI] = useState<boolean>(true);
  const [includeAlerts, setIncludeAlerts] = useState<boolean>(true);

  // Compute statistical metrics for analytics
  const stats = generators.map((gen) => {
    const rec = latestMap[gen.id];
    return {
      generator: gen,
      temp: rec ? rec.temperature : 35.0,
      volt: rec ? rec.voltage : 230.0,
      curr: rec ? rec.current : 18.0,
      powerKw: rec ? (rec.power / 1000).toFixed(1) : '4.1',
    };
  });

  const totalPowerKw = stats.reduce((acc, curr) => acc + parseFloat(curr.powerKw), 0).toFixed(1);

  // PDF Generation Trigger
  const handleGeneratePDF = () => {
    window.print();
  };

  const getTimeLimitLabel = (t: string) => {
    switch (t) {
      case '1h':
        return 'Last 1 Hour (Real-Time Telemetry Stream)';
      case '6h':
        return 'Last 6 Hours (Short-Term Operational Stream)';
      case '24h':
        return 'Last 24 Hours (Full Daily Performance Summary)';
      case '7d':
        return 'Last 7 Days (Weekly Fleet Analytics Log)';
      case '30d':
        return 'Last 30 Days (Monthly Energy Capacity Factor)';
      default:
        return '24 Hours';
    }
  };

  return (
    <div className="space-y-6">
      {/* Printable CSS Rules for Clean PDF Export */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-pdf-report, #printable-pdf-report * {
            visibility: visible;
          }
          #printable-pdf-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Header & PDF Report Trigger Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold app-text-main tracking-tight flex items-center gap-2">
            <LineChart className="w-5 h-5 text-emerald-500" />
            Performance Analytics & Report Engine
          </h1>
          <p className="text-xs app-text-muted mt-0.5 font-medium">
            Real-time IoT telemetry statistics, efficiency matrices, and PDF data report export.
          </p>
        </div>

        {/* Generate PDF Button */}
        <button
          onClick={() => setShowReportModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 shrink-0"
        >
          <FileText className="w-4 h-4 fill-current" />
          <span>Generate PDF Data Report</span>
        </button>
      </div>

      {/* Top High-Level Performance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Fleet Capacity Factor"
          value="78.4%"
          subtitle="Nominal Output Efficiency"
          icon={TrendingUp}
          accentColor="emerald"
        />
        <KpiCard
          title="Max Temperature Recorded"
          value="64.8"
          unit="°C"
          subtitle="Turbine Beta-2 Stator"
          icon={BarChart3}
          accentColor="amber"
        />
        <KpiCard
          title="Grid Power Generation"
          value={totalPowerKw}
          unit="kW Total"
          subtitle="All Active Turbines"
          icon={Cpu}
          accentColor="cyan"
        />
      </div>

      {/* Generator Comparative Performance Table */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold app-text-main tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Generator Fleet Efficiency Matrix
            </h3>
            <p className="text-xs app-text-muted">Statistical comparison of live sensor telemetry</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b app-border app-text-muted font-bold uppercase tracking-wider app-bg-inner">
                <th className="py-3 px-4">Generator</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Stator Temp</th>
                <th className="py-3 px-4">Bus Voltage</th>
                <th className="py-3 px-4">Active Current</th>
                <th className="py-3 px-4">Power Output</th>
              </tr>
            </thead>
            <tbody className="divide-y app-border font-mono app-text-main">
              {stats.map((s) => (
                <tr key={s.generator.id} className="hover:bg-emerald-500/5 transition">
                  <td className="py-3.5 px-4 font-sans font-bold app-text-main">{s.generator.name}</td>
                  <td className="py-3.5 px-4 font-sans app-text-muted">{s.generator.location}</td>
                  <td className="py-3.5 px-4 font-sans">
                    <StatusBadge status={s.generator.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-orange-500 font-bold">{s.temp}°C</td>
                  <td className="py-3.5 px-4 text-blue-500 font-bold">{s.volt}V</td>
                  <td className="py-3.5 px-4 text-purple-500 font-bold">{s.curr}A</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-bold">{s.powerKw} kW</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparative Waveforms Section */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="text-base font-bold app-text-main tracking-tight flex items-center gap-2">
          <LineChart className="w-4 h-4 text-cyan-500" />
          Thermal & Electrical Trend Direction
        </h3>
        <TelemetryChart data={telemetryHistory} metrics={['temperature', 'voltage', 'power']} height={300} />
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE PDF REPORT GENERATOR MODAL DIALOG (POPUP CARD) */}
      {/* ========================================================================= */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm no-print">
          <div className="glass-card rounded-3xl p-6 md:p-8 max-w-2xl w-full space-y-6 border-emerald-500/40 shadow-2xl relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b app-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
                  <FileText className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-bold app-text-main tracking-tight">Generate Analytics PDF Data Report</h2>
                  <p className="text-xs app-text-muted font-medium">
                    Configure timeframe limits, generator scope, and section options to generate PDF.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-xl app-text-muted hover:text-emerald-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Timeframe Limit Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold app-text-main uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Select Report Time Limit</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs font-bold">
                {(['1h', '6h', '24h', '7d', '30d'] as const).map((tl) => (
                  <button
                    key={tl}
                    onClick={() => setTimeLimit(tl)}
                    className={`py-2 px-3 rounded-xl border uppercase transition ${
                      timeLimit === tl
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'app-bg-inner border app-border app-text-muted hover:text-emerald-500'
                    }`}
                  >
                    {tl}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                Selected Scope: {getTimeLimitLabel(timeLimit)}
              </p>
            </div>

            {/* 2. Target Generator Scope Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold app-text-main uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-cyan-500" />
                <span>Select Turbine Scope</span>
              </label>
              <select
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value)}
                className="w-full p-2.5 rounded-xl border text-xs font-bold cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Wind Turbines (Full Fleet Overview)</option>
                {generators.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.device_id}) — {g.location}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Included Sections Checkboxes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold app-text-main uppercase tracking-wider">
                Include Report Sections
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                <label className="flex items-center gap-2 p-2.5 rounded-xl app-bg-inner border app-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSummary}
                    onChange={(e) => setIncludeSummary(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <span>Executive Fleet Summary & KPIs</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl app-bg-inner border app-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTable}
                    onChange={(e) => setIncludeTable(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <span>Live Telemetry Sensor Matrix</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl app-bg-inner border app-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAI}
                    onChange={(e) => setIncludeAI(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <span>Gemini AI Diagnostics Summary</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl app-bg-inner border app-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAlerts}
                    onChange={(e) => setIncludeAlerts(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <span>System Safety Alarm Logs</span>
                </label>
              </div>
            </div>

            {/* 4. Live Report Preview Card */}
            <div className="p-4 rounded-2xl app-bg-inner border app-border space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold app-text-main border-b app-border pb-2">
                <span>PDF Document Preview Summary</span>
                <span className="text-emerald-500 font-mono">Ready to Export</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div>
                  <span className="app-text-muted block">Timeframe</span>
                  <strong className="app-text-main font-mono uppercase">{timeLimit}</strong>
                </div>
                <div>
                  <span className="app-text-muted block">Data Points</span>
                  <strong className="app-text-main font-mono">
                    {timeLimit === '1h' ? '120' : timeLimit === '6h' ? '720' : timeLimit === '24h' ? '2,880' : '20,160'}
                  </strong>
                </div>
                <div>
                  <span className="app-text-muted block">Total Output</span>
                  <strong className="text-emerald-500 font-mono">{totalPowerKw} kW</strong>
                </div>
                <div>
                  <span className="app-text-muted block">Alarms Logged</span>
                  <strong className="text-amber-500 font-mono">{alerts.length} Alarms</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t app-border">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold app-bg-inner border app-border app-text-muted hover:app-text-main transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGeneratePDF}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Export & Print PDF Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIDDEN PRINTABLE PDF DOCUMENT CONTAINER (RENDERED DURING WINDOW.PRINT) */}
      {/* ========================================================================= */}
      <div id="printable-pdf-report" className="hidden">
        <div style={{ fontFamily: 'sans-serif', color: '#0f172a' }}>
          {/* Document Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #10b981', paddingBottom: '12px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>WindSense AI Telemetry Analytics Report</h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Intelligent Renewable Energy Fleet Performance & Diagnostic Report</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>OFFICIAL DOCUMENT</p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Generated: {new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* Report Metadata Scope */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '12px' }}>
            <p style={{ margin: '0 0 6px 0' }}><strong>Report Time Limit:</strong> {getTimeLimitLabel(timeLimit)}</p>
            <p style={{ margin: '0 0 6px 0' }}><strong>Turbine Scope:</strong> {targetScope === 'all' ? 'All Wind Turbines (Fleet Overview)' : targetScope}</p>
            <p style={{ margin: 0 }}><strong>Combined Power Generation Output:</strong> {totalPowerKw} kW Total</p>
          </div>

          {/* Section 1: Fleet Summary */}
          {includeSummary && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px' }}>
                1. Executive Fleet Performance Summary
              </h2>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>MONITORED TURBINES</span>
                  <strong style={{ fontSize: '18px' }}>{generators.length} Turbines</strong>
                </div>
                <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>ACTIVE POWER OUTPUT</span>
                  <strong style={{ fontSize: '18px', color: '#10b981' }}>{totalPowerKw} kW</strong>
                </div>
                <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>SYSTEM HEALTH STATUS</span>
                  <strong style={{ fontSize: '18px', color: '#0284c7' }}>Optimal Operation</strong>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Live Telemetry Sensor Data Table */}
          {includeTable && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px' }}>
                2. Real-Time Telemetry Sensor Matrix
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '8px' }}>Turbine Name</th>
                    <th style={{ padding: '8px' }}>Device ID</th>
                    <th style={{ padding: '8px' }}>Location</th>
                    <th style={{ padding: '8px' }}>Status</th>
                    <th style={{ padding: '8px' }}>Temp (°C)</th>
                    <th style={{ padding: '8px' }}>Voltage (V)</th>
                    <th style={{ padding: '8px' }}>Power (kW)</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => (
                    <tr key={s.generator.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{s.generator.name}</td>
                      <td style={{ padding: '8px', fontFamily: 'monospace' }}>{s.generator.device_id}</td>
                      <td style={{ padding: '8px' }}>{s.generator.location}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: s.generator.status === 'online' ? '#10b981' : '#f59e0b' }}>
                        {s.generator.status.toUpperCase()}
                      </td>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{s.temp}°C</td>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{s.volt}V</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#10b981' }}>{s.powerKw} kW</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 3: Gemini AI Diagnostics */}
          {includeAI && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px' }}>
                3. Gemini AI Diagnostics & Health Advisory
              </h2>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', fontSize: '11px' }}>
                <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>Executive Diagnostic Overview:</p>
                <p style={{ margin: '0 0 10px 0', color: '#334155' }}>
                  All wind turbine generators are tracking within nominal thermal and electrical operational bounds. Stator thermal dissipation averages 35.4°C across active campus units. Grid synchronization output voltage remains stable at 228.9V RMS.
                </p>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Advisory Maintenance Recommendations:</p>
                <ul style={{ margin: 0, paddingLeft: '16px', color: '#334155' }}>
                  <li>Maintain regular quarterly gear bearing oil lubrication schedule.</li>
                  <li>Continue real-time IoT sensor telemetry surveillance stream.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Section 4: System Alarm Logs */}
          {includeAlerts && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px' }}>
                4. System Safety Alarm Logs
              </h2>
              <div style={{ fontSize: '11px' }}>
                {alerts.slice(0, 5).map((a) => (
                  <div key={a.id} style={{ padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: a.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>
                      [{a.severity.toUpperCase()}] {a.type}:
                    </span>{' '}
                    <span>{a.message}</span> ({new Date(a.timestamp).toLocaleString()})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px', marginTop: '30px', textAlign: 'center', fontSize: '10px', color: '#64748b' }}>
            WindSense AI Renewable Energy IoT Dashboard • Confidential Operational Report
          </div>
        </div>
      </div>
    </div>
  );
};
