import { Request, Response } from 'express';
import { supabaseService } from '../services/supabase.service';

export const telemetryController = {
  async getLatestTelemetry(req: Request, res: Response) {
    try {
      const mode = (req.query.mode as string) || (req.headers['x-data-mode'] as string);
      const latest = await supabaseService.getLatestTelemetry(mode);
      return res.json({ success: true, data: latest });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch latest telemetry' });
    }
  },

  async getTelemetryByGenerator(req: Request, res: Response) {
    try {
      const { generatorId } = req.params;
      const limit = parseInt((req.query.limit as string) || '100', 10);
      const mode = (req.query.mode as string) || (req.headers['x-data-mode'] as string);
      const history = await supabaseService.getTelemetryHistory(generatorId, limit, mode);
      return res.json({ success: true, count: history.length, generatorId, data: history });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch telemetry history' });
    }
  },

  async ingestTelemetry(req: Request, res: Response) {
    try {
      const { device_id, temperature, humidity, voltage, current, rpm } = req.body || {};

      if (!device_id || temperature === undefined || voltage === undefined || current === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required telemetry parameters (device_id, temperature, voltage, current required)',
        });
      }

      const record = await supabaseService.ingestTelemetry({
        device_id: String(device_id),
        temperature: Number(temperature),
        humidity: Number(humidity || 45.0),
        voltage: Number(voltage),
        current: Number(current),
        rpm: rpm ? Number(rpm) : undefined,
      });

      console.log(`[ESP32 Ingestion] Packet received from ${device_id}: ${temperature}°C, ${voltage}V, ${current}A`);
      return res.status(201).json({
        success: true,
        message: 'Telemetry packet ingested successfully',
        data: record,
      });
    } catch (err: any) {
      console.error('[ESP32 Ingest Error]', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to ingest telemetry packet' });
    }
  },
};
