export interface WindGenerator {
  id: string;
  device_id: string;
  name: string;
  location: string;
  description: string;
  rated_power_kw: number;
  status: 'online' | 'offline' | 'warning' | 'critical';
  last_seen: string;
  created_at: string;
}

export interface TelemetryRecord {
  id: number;
  generator_id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  voltage: number;
  current: number;
  power: number;
  rpm: number;
}

export interface AlertRecord {
  id: string;
  generator_id: string;
  severity: 'info' | 'warning' | 'critical';
  type: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

export interface AIAnalysisRecord {
  id: string;
  generator_id: string;
  created_at: string;
  health_status: 'Optimal' | 'Degraded' | 'Attention Required' | 'Critical Failure Risk';
  summary: string;
  performance_insights: string[];
  recommendations: string[];
  observations: string[];
  telemetry_snapshot: {
    temperature: number;
    humidity: number;
    voltage: number;
    current: number;
    power: number;
    rpm: number;
  };
}

class TelemetrySimulator {
  private generators: WindGenerator[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      device_id: 'ESP32-WIND-001',
      name: 'Turbine Alpha-1',
      location: 'North Ridge Sector A',
      description: 'Primary 75kW Direct-Drive Campus Wind Turbine',
      rated_power_kw: 75.0,
      status: 'online',
      last_seen: new Date().toISOString(),
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
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
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      device_id: 'ESP32-WIND-003',
      name: 'Turbine Gamma-3',
      location: 'Coastal Hill Station',
      description: '100kW High-Efficiency Offshore Model',
      rated_power_kw: 100.0,
      status: 'online',
      last_seen: new Date().toISOString(),
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      device_id: 'ESP32-WIND-004',
      name: 'Turbine Delta-4',
      location: 'West Ridge Sector C',
      description: '50kW Experimental Pitch-Control Unit',
      rated_power_kw: 50.0,
      status: 'critical',
      last_seen: new Date(Date.now() - 15 * 60000).toISOString(),
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  ];

  private telemetryHistory: Map<string, TelemetryRecord[]> = new Map();
  private alerts: AlertRecord[] = [];
  private aiAnalyses: Map<string, AIAnalysisRecord[]> = new Map();
  private idCounter = 100;

  constructor() {
    this.seedInitialHistory();
    this.seedAlerts();
    this.startSimulationLoop();
  }

  private seedInitialHistory() {
    const now = Date.now();
    const intervalMs = 60000;
    const totalPoints = 120;

    for (const gen of this.generators) {
      const records: TelemetryRecord[] = [];
      let baseTemp = gen.status === 'warning' ? 58 : gen.status === 'critical' ? 45 : 32;
      let baseVolt = gen.status === 'critical' ? 145 : 230;
      let baseCurr = gen.status === 'critical' ? 2 : gen.status === 'warning' ? 26 : 20;

      for (let i = totalPoints; i >= 0; i--) {
        const timestamp = new Date(now - i * intervalMs).toISOString();
        const noiseTemp = (Math.random() - 0.5) * 1.5;
        const noiseVolt = (Math.random() - 0.5) * 3.0;
        const noiseCurr = (Math.random() - 0.5) * 1.0;

        const temp = parseFloat(Math.max(20, baseTemp + noiseTemp).toFixed(1));
        const volt = parseFloat(Math.max(100, baseVolt + noiseVolt).toFixed(1));
        const curr = parseFloat(Math.max(0, baseCurr + noiseCurr).toFixed(1));
        const power = parseFloat((volt * curr).toFixed(1));
        const rpm = Math.round(curr * 70 + Math.random() * 20);

        records.push({
          id: this.idCounter++,
          generator_id: gen.id,
          timestamp,
          temperature: temp,
          humidity: parseFloat((45 + Math.random() * 10).toFixed(1)),
          voltage: volt,
          current: curr,
          power,
          rpm,
        });
      }
      this.telemetryHistory.set(gen.id, records);
    }
  }

  private seedAlerts() {
    this.alerts = [
      {
        id: 'a101',
        generator_id: '22222222-2222-2222-2222-222222222222',
        severity: 'warning',
        type: 'High Temperature Warning',
        message: 'Generator stator temperature sustained above 62°C threshold.',
        timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
        acknowledged: false,
      },
      {
        id: 'a102',
        generator_id: '44444444-4444-4444-4444-444444444444',
        severity: 'critical',
        type: 'Critical Voltage Drop',
        message: 'Bus voltage fallen to 142V. Pitch brake engaged to prevent generator overload.',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        acknowledged: false,
      },
      {
        id: 'a103',
        generator_id: '11111111-1111-1111-1111-111111111111',
        severity: 'info',
        type: 'Scheduled Maintenance',
        message: 'Turbine Alpha-1 routine blade clean and alignment check completed.',
        timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
        acknowledged: true,
        acknowledged_by: 'u1',
        acknowledged_at: new Date(Date.now() - 47 * 3600000).toISOString(),
      },
    ];
  }

  private startSimulationLoop() {
    setInterval(() => {
      const now = new Date().toISOString();
      for (const gen of this.generators) {
        if (gen.status === 'offline') continue;

        const records = this.telemetryHistory.get(gen.id) || [];
        const lastRec = records[records.length - 1] || {
          temperature: 32,
          humidity: 45,
          voltage: 230,
          current: 18,
          rpm: 1400,
        };

        const deltaTemp = (Math.random() - 0.48) * 0.4;
        const deltaVolt = (Math.random() - 0.5) * 1.2;
        const deltaCurr = (Math.random() - 0.5) * 0.4;

        const temp = parseFloat(Math.min(95, Math.max(15, lastRec.temperature + deltaTemp)).toFixed(1));
        const volt = parseFloat(Math.min(300, Math.max(120, lastRec.voltage + deltaVolt)).toFixed(1));
        const curr = parseFloat(Math.min(60, Math.max(0, lastRec.current + deltaCurr)).toFixed(1));
        const power = parseFloat((volt * curr).toFixed(1));
        const rpm = Math.round(curr * 72 + Math.random() * 15);

        gen.last_seen = now;

        const newRecord: TelemetryRecord = {
          id: this.idCounter++,
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
        if (records.length > 500) records.shift();
        this.telemetryHistory.set(gen.id, records);
      }
    }, 4000);
  }

  public getGenerators(): WindGenerator[] {
    return this.generators;
  }

  public getGeneratorById(id: string): WindGenerator | undefined {
    return this.generators.find((g) => g.id === id || g.device_id === id);
  }

  public addGenerator(genData: {
    device_id: string;
    name: string;
    location: string;
    description?: string;
    rated_power_kw: number;
    status?: string;
  }): WindGenerator {
    const newGen: WindGenerator = {
      id: `gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      device_id: genData.device_id,
      name: genData.name,
      location: genData.location,
      description: genData.description || 'ESP32 Monitored Turbine Unit',
      rated_power_kw: genData.rated_power_kw,
      status: (genData.status as any) || 'online',
      last_seen: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    this.generators.push(newGen);
    this.telemetryHistory.set(newGen.id, []);
    return newGen;
  }

  public deleteGenerator(id: string): boolean {
    const index = this.generators.findIndex((g) => g.id === id || g.device_id === id);
    if (index !== -1) {
      const removed = this.generators.splice(index, 1)[0];
      this.telemetryHistory.delete(removed.id);
      return true;
    }
    return false;
  }

  public ingestDirectTelemetry(generatorId: string, record: Partial<TelemetryRecord>) {
    const recs = this.telemetryHistory.get(generatorId) || [];
    const newRec: TelemetryRecord = {
      id: this.idCounter++,
      generator_id: generatorId,
      timestamp: record.timestamp || new Date().toISOString(),
      temperature: record.temperature || 32,
      humidity: record.humidity || 45,
      voltage: record.voltage || 230,
      current: record.current || 18,
      power: record.power || (record.voltage || 230) * (record.current || 18),
      rpm: record.rpm || 1400,
    };
    recs.push(newRec);
    if (recs.length > 500) recs.shift();
    this.telemetryHistory.set(generatorId, recs);

    const gen = this.getGeneratorById(generatorId);
    if (gen) {
      gen.last_seen = newRec.timestamp;
      if (newRec.temperature > 70) gen.status = 'warning';
    }
  }

  public getLatestTelemetry(): Record<string, TelemetryRecord> {
    const result: Record<string, TelemetryRecord> = {};
    for (const gen of this.generators) {
      const recs = this.telemetryHistory.get(gen.id) || [];
      if (recs.length > 0) {
        result[gen.id] = recs[recs.length - 1];
      }
    }
    return result;
  }

  public getTelemetryHistory(generatorId: string, limit = 100): TelemetryRecord[] {
    const recs = this.telemetryHistory.get(generatorId) || [];
    return recs.slice(-limit);
  }

  public getAlerts(): AlertRecord[] {
    return this.alerts;
  }

  public acknowledgeAlert(alertId: string, userId?: string): AlertRecord | null {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledged_by = userId || 'demo-user-id';
      alert.acknowledged_at = new Date().toISOString();
      return alert;
    }
    return null;
  }

  public addAIAnalysis(analysis: AIAnalysisRecord) {
    const existing = this.aiAnalyses.get(analysis.generator_id) || [];
    existing.unshift(analysis);
    this.aiAnalyses.set(analysis.generator_id, existing);
  }

  public getAIAnalyses(generatorId: string): AIAnalysisRecord[] {
    return this.aiAnalyses.get(generatorId) || [];
  }
}

export const simulator = new TelemetrySimulator();
