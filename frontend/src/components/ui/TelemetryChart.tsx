import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TelemetryRecord } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface TelemetryChartProps {
  data: TelemetryRecord[];
  metrics?: ('temperature' | 'humidity' | 'voltage' | 'current' | 'power' | 'rpm')[];
  height?: number;
  showLegend?: boolean;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  data,
  metrics = ['temperature', 'voltage', 'power'],
  height = 320,
  showLegend = true,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const formattedData = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    powerKw: parseFloat((d.power / 1000).toFixed(2)),
  }));

  const metricConfigs = {
    temperature: { key: 'temperature', name: 'Temp (°C)', color: '#f97316' },
    humidity: { key: 'humidity', name: 'Humidity (%)', color: '#06b6d4' },
    voltage: { key: 'voltage', name: 'Voltage (V)', color: '#3b82f6' },
    current: { key: 'current', name: 'Current (A)', color: '#a855f7' },
    power: { key: 'powerKw', name: 'Power (kW)', color: '#10b981' },
    rpm: { key: 'rpm', name: 'Rotor RPM', color: '#eab308' },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-xl shadow-xl border text-xs font-sans">
          <p className="font-mono font-bold app-text-main mb-2 border-b app-border pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold app-text-main">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl app-bg-inner border app-border app-text-muted text-xs"
        style={{ height }}
      >
        <p className="font-semibold">No telemetry stream available for this timeframe</p>
        <p className="text-[11px] app-text-subtle mt-1">Waiting for incoming sensor data packets...</p>
      </div>
    );
  }

  const gridColor = isLight ? '#e2e8f0' : '#1f2937';
  const axisColor = isLight ? '#64748b' : '#94a3b8';

  return (
    <div className="w-full relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="time"
            stroke={axisColor}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={{ stroke: gridColor }} />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: axisColor }}
            />
          )}
          {metrics.map((m) => {
            const conf = metricConfigs[m];
            if (!conf) return null;
            return (
              <Line
                key={m}
                type="monotone"
                dataKey={conf.key}
                name={conf.name}
                stroke={conf.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: isLight ? '#ffffff' : '#0b0f17' }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
