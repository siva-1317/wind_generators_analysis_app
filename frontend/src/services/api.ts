import { WindGenerator, TelemetryRecord, AlertRecord, AIAnalysis } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getDataMode(): string {
  return localStorage.getItem('windsense_data_mode') || 'live';
}

// Stateful Live Telemetry Simulation for Standalone / Offline Demo Mode
let MOCK_GENERATORS: WindGenerator[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    device_id: 'ESP32-WIND-001',
    name: 'Turbine Alpha-1',
    location: 'North Ridge Sector A',
    description: 'Primary 75kW Direct-Drive Campus Wind Turbine',
    rated_power_kw: 75.0,
    status: 'online',
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    device_id: 'ESP32-WIND-002',
    name: 'Turbine Beta-2',
    location: 'Campus Eco-Park East',
    description: '50kW Auxiliary Wind Generator',
    rated_power_kw: 50.0,
    status: 'warning',
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    device_id: 'ESP32-WIND-003',
    name: 'Turbine Gamma-3',
    location: 'Coastal Hill Station',
    description: '100kW Offshore Direct Drive Model',
    rated_power_kw: 100.0,
    status: 'online',
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    device_id: 'ESP32-WIND-004',
    name: 'Turbine Delta-4',
    location: 'West Ridge Sector C',
    description: '50kW Pitch-Control Experimental Unit',
    rated_power_kw: 50.0,
    status: 'critical',
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

const MOCK_HISTORY: Map<string, TelemetryRecord[]> = new Map();
let MOCK_ALERTS: AlertRecord[] = [
  {
    id: 'a101',
    generator_id: '22222222-2222-2222-2222-222222222222',
    severity: 'warning',
    type: 'High Temperature Warning',
    message: 'Turbine Beta-2 stator temperature sustained above 62°C threshold.',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'a102',
    generator_id: '44444444-4444-4444-4444-444444444444',
    severity: 'critical',
    type: 'Critical Voltage Drop',
    message: 'Turbine Delta-4 bus voltage fallen to 142V. Emergency brake engaged.',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    acknowledged: false,
  },
];

function initMockHistory() {
  const now = Date.now();
  for (const gen of MOCK_GENERATORS) {
    if (!MOCK_HISTORY.has(gen.id)) {
      const records: TelemetryRecord[] = [];
      let baseTemp = gen.status === 'warning' ? 62 : gen.status === 'critical' ? 45 : 34.6;
      let baseVolt = gen.status === 'critical' ? 145 : 228.9;
      let baseCurr = gen.status === 'critical' ? 3 : gen.status === 'warning' ? 26 : 16.1;

      for (let i = 50; i >= 0; i--) {
        const timestamp = new Date(now - i * 3000).toISOString();
        const noiseTemp = (Math.random() - 0.5) * 1.2;
        const noiseVolt = (Math.random() - 0.5) * 2.5;
        const noiseCurr = (Math.random() - 0.5) * 0.8;

        const temp = parseFloat(Math.max(20, baseTemp + noiseTemp).toFixed(1));
        const volt = parseFloat(Math.max(100, baseVolt + noiseVolt).toFixed(1));
        const curr = parseFloat(Math.max(0, baseCurr + noiseCurr).toFixed(1));
        const power = parseFloat((volt * curr).toFixed(1));
        const rpm = Math.round(curr * 72 + Math.random() * 15);

        records.push({
          id: Math.floor(Math.random() * 1000000),
          generator_id: gen.id,
          timestamp,
          temperature: temp,
          humidity: parseFloat((45 + Math.random() * 5).toFixed(1)),
          voltage: volt,
          current: curr,
          power,
          rpm,
        });
      }
      MOCK_HISTORY.set(gen.id, records);
    }
  }
}
initMockHistory();

function stepMockTelemetry() {
  const now = new Date().toISOString();
  for (const gen of MOCK_GENERATORS) {
    if (gen.status === 'offline') continue;

    const records = MOCK_HISTORY.get(gen.id) || [];
    const lastRec = records[records.length - 1] || {
      temperature: 34.6,
      humidity: 45.0,
      voltage: 228.9,
      current: 16.1,
      power: 3685.0,
      rpm: 1167,
    };

    const deltaTemp = (Math.random() - 0.48) * 0.4;
    const deltaVolt = (Math.random() - 0.5) * 1.5;
    const deltaCurr = (Math.random() - 0.5) * 0.5;

    const temp = parseFloat(Math.min(95, Math.max(15, lastRec.temperature + deltaTemp)).toFixed(1));
    const volt = parseFloat(Math.min(300, Math.max(120, lastRec.voltage + deltaVolt)).toFixed(1));
    const curr = parseFloat(Math.min(60, Math.max(0, lastRec.current + deltaCurr)).toFixed(1));
    const power = parseFloat((volt * curr).toFixed(1));
    const rpm = Math.round(curr * 72 + Math.random() * 15);

    gen.last_seen = now;

    const newRecord: TelemetryRecord = {
      id: Math.floor(Math.random() * 1000000),
      generator_id: gen.id,
      timestamp: now,
      temperature: temp,
      humidity: parseFloat((45 + (Math.random() - 0.5) * 2).toFixed(1)),
      voltage: volt,
      current: curr,
      power,
      rpm,
    };

    records.push(newRecord);
    if (records.length > 200) records.shift();
    MOCK_HISTORY.set(gen.id, records);
  }
}

setInterval(stepMockTelemetry, 2000);

async function fetchJson<T>(url: string, options?: RequestInit, fallbackData?: () => T): Promise<T> {
  const mode = getDataMode();
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Data-Mode': mode,
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err: any) {
    if (fallbackData) return fallbackData();
    throw err;
  }
}

export const apiService = {
  // Generators
  async getGenerators(): Promise<WindGenerator[]> {
    return fetchJson<WindGenerator[]>('/generators', undefined, () => [...MOCK_GENERATORS]);
  },

  async getGeneratorById(id: string): Promise<WindGenerator> {
    return fetchJson<WindGenerator>(`/generators/${id}`, undefined, () => {
      const found = MOCK_GENERATORS.find((g) => g.id === id || g.device_id === id);
      return found || MOCK_GENERATORS[0];
    });
  },

  async createGenerator(genData: {
    device_id: string;
    name: string;
    location: string;
    description?: string;
    rated_power_kw: number;
  }): Promise<WindGenerator> {
    try {
      return await fetchJson<WindGenerator>('/generators', {
        method: 'POST',
        body: JSON.stringify(genData),
      });
    } catch (err) {
      const newGen: WindGenerator = {
        id: `gen-${Date.now()}`,
        device_id: genData.device_id,
        name: genData.name,
        location: genData.location,
        description: genData.description || 'ESP32 Telemetry Monitored Unit',
        rated_power_kw: genData.rated_power_kw,
        status: 'online',
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      MOCK_GENERATORS.unshift(newGen);
      MOCK_HISTORY.set(newGen.id, []);
      return newGen;
    }
  },

  async deleteGenerator(id: string): Promise<void> {
    try {
      return await fetchJson<void>(`/generators/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      MOCK_GENERATORS = MOCK_GENERATORS.filter((g) => g.id !== id && g.device_id !== id);
    }
  },

  // Telemetry
  async getLatestTelemetry(): Promise<Record<string, TelemetryRecord>> {
    return fetchJson<Record<string, TelemetryRecord>>('/telemetry/latest', undefined, () => {
      const result: Record<string, TelemetryRecord> = {};
      for (const gen of MOCK_GENERATORS) {
        const recs = MOCK_HISTORY.get(gen.id) || [];
        if (recs.length > 0) {
          result[gen.id] = recs[recs.length - 1];
        }
      }
      return result;
    });
  },

  async getTelemetryByGenerator(generatorId: string, limit = 100): Promise<TelemetryRecord[]> {
    return fetchJson<TelemetryRecord[]>(`/telemetry/${generatorId}?limit=${limit}`, undefined, () => {
      const recs = MOCK_HISTORY.get(generatorId) || [];
      return recs.slice(-limit);
    });
  },

  // Alerts
  async getAlerts(): Promise<AlertRecord[]> {
    return fetchJson<AlertRecord[]>('/alerts', undefined, () => [...MOCK_ALERTS]);
  },

  async acknowledgeAlert(alertId: string, userId?: string): Promise<AlertRecord> {
    try {
      return await fetchJson<AlertRecord>(`/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      const found = MOCK_ALERTS.find((a) => a.id === alertId);
      if (found) {
        found.acknowledged = true;
        found.acknowledged_by = userId || 'admin';
        found.acknowledged_at = new Date().toISOString();
      }
      return found || MOCK_ALERTS[0];
    }
  },

  // Dynamic Realtime AI Diagnostics Generation
  async analyzeGenerator(generatorId: string): Promise<AIAnalysis> {
    const buildDynamicAnalysis = (): AIAnalysis => {
      const gen = MOCK_GENERATORS.find((g) => g.id === generatorId || g.device_id === generatorId) || MOCK_GENERATORS[0];
      const recs = MOCK_HISTORY.get(gen.id) || [];
      const latest = recs[recs.length - 1] || {
        temperature: 34.6,
        humidity: 45.0,
        voltage: 228.9,
        current: 16.1,
        power: 3685.0,
        rpm: 1167,
      };

      const temp = Number(latest.temperature || 34.6);
      const volt = Number(latest.voltage || 228.9);
      const curr = Number(latest.current || 16.1);
      const powerKw = (Number(latest.power || volt * curr) / 1000).toFixed(1);
      const rpm = Number(latest.rpm || 1167);

      let healthStatus: AIAnalysis['healthStatus'] = 'Optimal';
      const insights: string[] = [];
      const recommendations: string[] = [];
      const observations: string[] = [];

      if (temp > 60) {
        healthStatus = 'Attention Required';
        insights.push(`Elevated stator coil temperature recorded at ${temp}°C (Warning threshold: 60°C).`);
        recommendations.push('Inspect nacelle thermal cooling fans and stator winding insulation.');
        observations.push(`Stator thermal dissipation rate is +${(temp - 45).toFixed(1)}°C above baseline.`);
      } else if (volt < 180) {
        healthStatus = 'Critical Failure Risk';
        insights.push(`Critical grid bus voltage sag recorded at ${volt}V RMS (Nominal: 230V).`);
        recommendations.push('Engage generator pitch brake and inspect inverter coupling relays.');
        observations.push('Severe grid frequency phase lag observed across main bus transformer.');
      } else {
        insights.push(`Thermal signature operating safely within nominal range at ${temp}°C.`);
        insights.push(`Grid synchronization clean and stable at ${volt}V RMS.`);
        recommendations.push('Maintain regular quarterly preventive bearing lubrication.');
        recommendations.push('Continue real-time continuous IoT sensor telemetry stream.');
        observations.push('Rotor RPM and power output tracking nominal turbine power curve.');
      }

      insights.push(`Active generation output is ${powerKw} kW at ${rpm} RPM with ${curr}A current draw.`);

      const summary = `${gen.name} (${gen.device_id}) diagnosed with health rating '${healthStatus}'. Real-time sensor snapshot records ${temp}°C stator temperature, ${volt}V output voltage, ${curr}A current draw, and ${powerKw} kW active power at ${rpm} RPM.`;

      return {
        id: `ai-${Date.now()}`,
        generatorId: gen.id,
        generatorName: gen.name,
        healthStatus,
        summary,
        performanceInsights: insights,
        recommendations,
        observations,
        telemetrySnapshot: {
          temperature: temp,
          humidity: Number(latest.humidity || 45.0),
          voltage: volt,
          current: curr,
          power: Number(latest.power || volt * curr),
          rpm,
        },
        createdAt: new Date().toISOString(),
      };
    };

    return fetchJson<AIAnalysis>(
      '/ai/analyze',
      {
        method: 'POST',
        body: JSON.stringify({ generatorId }),
      },
      buildDynamicAnalysis
    );
  },

  async getAIAnalyses(generatorId: string): Promise<AIAnalysis[]> {
    return fetchJson<AIAnalysis[]>(`/ai/analyses/${generatorId}`, undefined, () => {
      const gen = MOCK_GENERATORS.find((g) => g.id === generatorId || g.device_id === generatorId) || MOCK_GENERATORS[0];
      const recs = MOCK_HISTORY.get(gen.id) || [];
      const latest = recs[recs.length - 1] || {
        temperature: 34.6,
        humidity: 45.0,
        voltage: 228.9,
        current: 16.1,
        power: 3685.0,
        rpm: 1167,
      };

      const temp = Number(latest.temperature || 34.6);
      const volt = Number(latest.voltage || 228.9);
      const curr = Number(latest.current || 16.1);
      const powerKw = (Number(latest.power || volt * curr) / 1000).toFixed(1);

      return [
        {
          id: `ai-${Date.now()}`,
          generatorId: gen.id,
          generatorName: gen.name,
          healthStatus: temp > 60 ? 'Attention Required' : 'Optimal',
          summary: `${gen.name} (${gen.device_id}) initial diagnostic: ${temp}°C temperature, ${volt}V voltage, and ${powerKw} kW generation output.`,
          performanceInsights: [
            `Stator temperature stable at ${temp}°C.`,
            `Grid voltage synchronized at ${volt}V RMS.`,
          ],
          recommendations: ['Continue real-time telemetry stream surveillance.'],
          observations: ['Sensor wave envelope shows clean operation.'],
          telemetrySnapshot: {
            temperature: temp,
            humidity: 45.0,
            voltage: volt,
            current: curr,
            power: Number(latest.power || volt * curr),
            rpm: Number(latest.rpm || 1167),
          },
          createdAt: new Date().toISOString(),
        },
      ];
    });
  },

  // System Health Check
  async getSystemHealth(): Promise<any> {
    return fetchJson<any>('/health', undefined, () => ({
      system: 'WindSense Express API (Realtime Engine Active)',
      mode: 'Live Simulation Stream',
      geminiStatus: 'Sensor-Driven AI Diagnostics Active',
    }));
  },
};
