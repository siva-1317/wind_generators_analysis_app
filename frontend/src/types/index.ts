export type GeneratorStatus = 'online' | 'offline' | 'warning' | 'critical';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type HealthStatus = 'Optimal' | 'Degraded' | 'Attention Required' | 'Critical Failure Risk';

export interface WindGenerator {
  id: string;
  device_id: string;
  name: string;
  location: string;
  description?: string;
  rated_power_kw: number;
  status: GeneratorStatus;
  last_seen: string;
  created_at: string;
  updated_at?: string;
}

export interface TelemetryRecord {
  id: number;
  generator_id: string;
  timestamp: string;
  temperature: number; // °C
  humidity: number;    // %
  voltage: number;     // V
  current: number;     // A
  power: number;       // W
  rpm: number;         // RPM
}

export interface AlertRecord {
  id: string;
  generator_id: string;
  severity: AlertSeverity;
  type: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

export interface AIAnalysis {
  id: string;
  generatorId: string;
  generatorName?: string;
  createdAt: string;
  healthStatus: HealthStatus;
  summary: string;
  performanceInsights: string[];
  recommendations: string[];
  observations: string[];
  telemetrySnapshot: {
    temperature: number;
    humidity: number;
    voltage: number;
    current: number;
    power: number;
    rpm: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  avatar_url?: string;
  provider?: string;
  email_verified?: boolean;
  last_sign_in_at?: string;
  created_at?: string;
  isDemo?: boolean;
}
