import { Request, Response } from 'express';
import { supabaseService } from '../services/supabase.service';

export const generatorsController = {
  async getAllGenerators(req: Request, res: Response) {
    try {
      const mode = (req.query.mode as string) || (req.headers['x-data-mode'] as string);
      const generators = await supabaseService.getGenerators(mode);
      return res.json({ success: true, count: generators.length, data: generators });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch generators' });
    }
  },

  async getGeneratorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const mode = (req.query.mode as string) || (req.headers['x-data-mode'] as string);
      const generator = await supabaseService.getGeneratorById(id, mode);
      if (!generator) {
        return res.status(404).json({ success: false, error: 'Wind generator not found' });
      }
      return res.json({ success: true, data: generator });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch generator' });
    }
  },

  async createGenerator(req: Request, res: Response) {
    try {
      const { device_id, name, location, description, rated_power_kw, status } = req.body || {};
      if (!device_id || !name || !location) {
        return res.status(400).json({ success: false, error: 'device_id, name, and location are required' });
      }

      const created = await supabaseService.createGenerator({
        device_id: String(device_id),
        name: String(name),
        location: String(location),
        description: description ? String(description) : undefined,
        rated_power_kw: rated_power_kw ? Number(rated_power_kw) : 50.0,
        status: status ? String(status) : 'online',
      });

      return res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to register generator' });
    }
  },

  async deleteGenerator(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await supabaseService.deleteGenerator(id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Generator not found or deletion failed' });
      }
      return res.json({ success: true, message: 'Wind generator removed successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to delete generator' });
    }
  },
};
