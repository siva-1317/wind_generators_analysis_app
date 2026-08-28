import React, { useState, useEffect } from 'react';
import { useGenerators } from '../hooks/useGenerators';
import { apiService } from '../services/api';
import { AIAnalysis } from '../types';
import { AIInsightCard } from '../components/ui/AIInsightCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Sparkles, RefreshCw, History } from 'lucide-react';

export const AIInsightsPage: React.FC = () => {
  const { generators } = useGenerators();
  const [selectedGeneratorId, setSelectedGeneratorId] = useState<string>('');
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AIAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const activeGenId = selectedGeneratorId || generators[0]?.id;

  useEffect(() => {
    if (activeGenId) {
      apiService
        .getAIAnalyses(activeGenId)
        .then((res) => {
          setAnalysisHistory(res);
          if (res.length > 0) setCurrentAnalysis(res[0]);
        })
        .catch((err) => console.error('Failed to load AI analyses:', err));
    }
  }, [activeGenId]);

  const handleRunAI = async () => {
    if (!activeGenId) return;
    setIsAnalyzing(true);
    try {
      const result = await apiService.analyzeGenerator(activeGenId);
      setCurrentAnalysis(result);
      setAnalysisHistory((prev) => [result, ...prev]);
    } catch (err) {
      console.error('Gemini AI execution failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedGen = generators.find((g) => g.id === activeGenId);

  return (
    <div className="space-y-6">
      {/* AI Hub Header Banner */}
      <div className="glass-card banner-gradient rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <h1 className="text-xl font-extrabold app-text-main tracking-tight">WindSense AI Intelligence Hub</h1>
          </div>
          <p className="text-xs app-text-muted max-w-xl leading-relaxed font-medium">
            Autonomous telemetry analytics engine powered by Google Gemini AI. Analyzes raw sensor readings, identifies anomalies, and generates advisory maintenance recommendations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
          <select
            value={activeGenId || ''}
            onChange={(e) => setSelectedGeneratorId(e.target.value)}
            className="app-input text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm border"
          >
            {generators.map((g) => (
              <option key={g.id} value={g.id} className="app-text-main app-bg-card">
                {g.name} ({g.device_id})
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAI}
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Gemini AI Model...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Analyze Current Telemetry</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active AI Diagnostic Result Display */}
      {currentAnalysis ? (
        <AIInsightCard analysis={currentAnalysis} />
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-emerald-500 mx-auto animate-pulse" />
          <h3 className="text-base font-bold app-text-main">No AI Analysis Run Yet</h3>
          <p className="text-xs app-text-muted max-w-md mx-auto">
            Click 'Analyze Current Telemetry' above to invoke Gemini AI diagnostics for{' '}
            <span className="text-emerald-500 font-bold">{selectedGen?.name || 'this turbine'}</span>.
          </p>
        </div>
      )}

      {/* Historical AI Diagnostic Reports List */}
      {analysisHistory.length > 1 && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold app-text-main tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-500" />
            Previous AI Analyses History
          </h3>
          <div className="space-y-3">
            {analysisHistory.slice(1).map((item) => (
              <div
                key={item.id}
                onClick={() => setCurrentAnalysis(item)}
                className="p-4 rounded-xl app-bg-inner border app-border hover:border-emerald-500/40 cursor-pointer transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={item.healthStatus} size="sm" />
                    <span className="font-bold app-text-main">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="app-text-muted line-clamp-1 font-medium">{item.summary}</p>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">View Report &rarr;</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
