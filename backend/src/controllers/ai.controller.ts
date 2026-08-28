import { Request, Response } from 'express';
import { supabaseService } from '../services/supabase.service';
import { geminiService } from '../services/gemini.service';

export const aiController = {
  async analyzeGenerator(req: Request, res: Response) {
    try {
      const { generatorId } = req.body || {};
      if (!generatorId) {
        return res.status(400).json({ success: false, error: 'generatorId is required' });
      }

      const generator = await supabaseService.getGeneratorById(generatorId);
      if (!generator) {
        return res.status(404).json({ success: false, error: 'Generator not found' });
      }

      const telemetry = await supabaseService.getTelemetryHistory(generatorId, 30);
      const allAlerts = await supabaseService.getAlerts();
      const activeAlerts = allAlerts.filter((a: any) => a.generator_id === generatorId && !a.acknowledged);

      const aiResult = await geminiService.analyzeTelemetry({
        generator,
        telemetry,
        activeAlerts,
      });

      const savedRecord = await supabaseService.saveAIAnalysis({
        generator_id: generatorId,
        health_status: aiResult.healthStatus,
        summary: aiResult.summary,
        performance_insights: aiResult.performanceInsights,
        recommendations: aiResult.recommendations,
        observations: aiResult.observations,
        telemetry_snapshot: aiResult.telemetrySnapshot,
        created_at: new Date().toISOString(),
      });

      return res.json({
        success: true,
        data: {
          id: savedRecord.id || 'ai-' + Date.now(),
          generatorId,
          generatorName: generator.name,
          ...aiResult,
          createdAt: savedRecord.created_at || new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[AI Controller Error]', err);
      return res.status(500).json({ success: false, error: err.message || 'AI Analysis failed' });
    }
  },

  async getAnalysesByGenerator(req: Request, res: Response) {
    try {
      const { generatorId } = req.params;
      const analyses = await supabaseService.getAIAnalyses(generatorId);
      return res.json({ success: true, count: analyses.length, data: analyses });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch AI analyses' });
    }
  },
};
