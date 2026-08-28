import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import { simulator } from './simulator.service';

let supabaseClient: SupabaseClient | null = null;

if (config.supabaseUrl && config.supabaseServiceKey && !config.supabaseUrl.includes('your-supabase-project')) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: { persistSession: false },
    });
    console.log('[Supabase] Server client connected to live PostgreSQL instance.');
  } catch (err) {
    console.warn('[Supabase] Init failed, operating with Simulator fallback:', err);
  }
} else {
  console.log('[Supabase] Using Standalone / Demo mode until credentials are standard in .env');
}

export const supabaseService = {
  getClient(): SupabaseClient | null {
    return supabaseClient;
  },

  async getGenerators(forceMode?: string) {
    if (forceMode === 'demo') {
      return simulator.getGenerators();
    }
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('wind_generators').select('*').order('name');
      if (!error && data && data.length > 0) return data;
    }
    return simulator.getGenerators();
  },

  async getGeneratorById(id: string, forceMode?: string) {
    if (forceMode === 'demo') {
      return simulator.getGeneratorById(id);
    }
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('wind_generators').select('*').eq('id', id).single();
      if (!error && data) return data;
    }
    return simulator.getGeneratorById(id);
  },

  async createGenerator(genData: {
    device_id: string;
    name: string;
    location: string;
    description?: string;
    rated_power_kw: number;
    status?: string;
  }) {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('wind_generators')
        .insert([
          {
            ...genData,
            status: genData.status || 'online',
            last_seen: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (!error && data) return data;
    }
    return simulator.addGenerator(genData);
  },

  async deleteGenerator(id: string) {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('wind_generators').delete().eq('id', id).select();
      if (!error) return true;
    }
    return simulator.deleteGenerator(id);
  },

  async ingestTelemetry(payload: {
    device_id: string;
    temperature: number;
    humidity: number;
    voltage: number;
    current: number;
    rpm?: number;
  }) {
    // 1. Find target generator
    let generator = await this.getGeneratorById(payload.device_id);
    if (!generator) {
      // Auto-register generator if unknown device_id sends valid telemetry
      generator = await this.createGenerator({
        device_id: payload.device_id,
        name: `Turbine ${payload.device_id}`,
        location: 'IoT Field Station',
        rated_power_kw: 50.0,
      });
    }

    const generatorId = generator.id;
    const power = parseFloat((payload.voltage * payload.current).toFixed(1));
    const timestamp = new Date().toISOString();

    const record = {
      generator_id: generatorId,
      timestamp,
      temperature: payload.temperature,
      humidity: payload.humidity,
      voltage: payload.voltage,
      current: payload.current,
      power,
      rpm: payload.rpm || Math.round(payload.current * 70),
    };

    // Update DB & Simulator memory
    if (supabaseClient) {
      await supabaseClient.from('telemetry').insert([record]);
      await supabaseClient
        .from('wind_generators')
        .update({ last_seen: timestamp, status: payload.temperature > 70 ? 'warning' : 'online' })
        .eq('id', generatorId);
    }

    simulator.ingestDirectTelemetry(generatorId, record);
    return record;
  },

  async getTelemetryHistory(generatorId: string, limit = 100, forceMode?: string) {
    if (forceMode === 'demo') {
      return simulator.getTelemetryHistory(generatorId, limit);
    }
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('telemetry')
        .select('*')
        .eq('generator_id', generatorId)
        .order('timestamp', { ascending: false })
        .limit(limit);
      if (!error && data && data.length > 0) return data.reverse();
    }
    return simulator.getTelemetryHistory(generatorId, limit);
  },

  async getLatestTelemetry(forceMode?: string) {
    if (forceMode === 'demo') {
      return simulator.getLatestTelemetry();
    }
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('telemetry')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(30);
      if (!error && data && data.length > 0) {
        const latestMap: Record<string, any> = {};
        for (const row of data) {
          if (!latestMap[row.generator_id]) latestMap[row.generator_id] = row;
        }
        return latestMap;
      }
    }
    return simulator.getLatestTelemetry();
  },

  async getAlerts(forceMode?: string) {
    if (forceMode === 'demo') {
      return simulator.getAlerts();
    }
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('alerts').select('*').order('timestamp', { ascending: false });
      if (!error && data && data.length > 0) return data;
    }
    return simulator.getAlerts();
  },

  async acknowledgeAlert(alertId: string, userId?: string) {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('alerts')
        .update({ acknowledged: true, acknowledged_by: userId, acknowledged_at: new Date().toISOString() })
        .eq('id', alertId)
        .select()
        .single();
      if (!error && data) return data;
    }
    return simulator.acknowledgeAlert(alertId, userId);
  },

  async saveAIAnalysis(analysis: any) {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('ai_analyses').insert([analysis]).select().single();
      if (!error && data) return data;
    }
    simulator.addAIAnalysis(analysis);
    return analysis;
  },

  async getAIAnalyses(generatorId: string) {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('ai_analyses')
        .select('*')
        .eq('generator_id', generatorId)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return simulator.getAIAnalyses(generatorId);
  },
};
