import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenerators } from '../hooks/useGenerators';
import { useRealtimeTelemetry } from '../hooks/useRealtimeTelemetry';
import { GeneratorCard } from '../components/ui/GeneratorCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SkeletonCard } from '../components/ui/SkeletonLoader';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, LayoutGrid, List, Wind } from 'lucide-react';

export const GeneratorsPage: React.FC = () => {
  const { generators, isLoading } = useGenerators();
  const { latestMap } = useRealtimeTelemetry();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredGenerators = generators.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.device_id.toLowerCase().includes(search.toLowerCase()) ||
      g.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 app-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by turbine name, ID, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Status Filter Tabs & Layout Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl app-bg-inner border app-border text-xs">
            {['all', 'online', 'warning', 'critical', 'offline'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                  statusFilter === st
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'app-text-muted hover:text-emerald-500'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center p-1 rounded-xl app-bg-inner border app-border app-text-muted">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-500/20 text-emerald-500' : ''}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-emerald-500/20 text-emerald-500' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid / Table Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredGenerators.length === 0 ? (
        <EmptyState
          title="No wind generators found"
          description="Try broadening your search term or changing status filter options."
          icon={Wind}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGenerators.map((gen) => (
            <GeneratorCard key={gen.id} generator={gen} telemetry={latestMap[gen.id]} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b app-border app-text-muted font-bold uppercase tracking-wider app-bg-inner">
                <th className="py-3 px-4">Turbine Name</th>
                <th className="py-3 px-4">Device ID</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Temp</th>
                <th className="py-3 px-4">Voltage</th>
                <th className="py-3 px-4">Current</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y app-border font-mono">
              {filteredGenerators.map((gen) => {
                const rec = latestMap[gen.id];
                return (
                  <tr key={gen.id} className="hover:bg-emerald-500/5 transition">
                    <td className="py-3.5 px-4 font-sans font-bold app-text-main">{gen.name}</td>
                    <td className="py-3.5 px-4 app-text-muted">{gen.device_id}</td>
                    <td className="py-3.5 px-4 font-sans app-text-main">{gen.location}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={gen.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-orange-500 font-bold">
                      {rec ? `${rec.temperature}°C` : '--'}
                    </td>
                    <td className="py-3.5 px-4 text-blue-500 font-bold">
                      {rec ? `${rec.voltage}V` : '--'}
                    </td>
                    <td className="py-3.5 px-4 text-purple-500 font-bold">
                      {rec ? `${rec.current}A` : '--'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <button
                        onClick={() => navigate(`/generators/${gen.id}`)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
