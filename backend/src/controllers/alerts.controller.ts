import { Request, Response } from 'express';
import { supabaseService } from '../services/supabase.service';

export const alertsController = {
  async getAlerts(req: Request, res: Response) {
    try {
      const alerts = await supabaseService.getAlerts();
      return res.json({ success: true, count: alerts.length, data: alerts });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch alerts' });
    }
  },

  async acknowledgeAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body || {};
      const updated = await supabaseService.acknowledgeAlert(id, userId);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Alert not found' });
      }
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to acknowledge alert' });
    }
  },
};
