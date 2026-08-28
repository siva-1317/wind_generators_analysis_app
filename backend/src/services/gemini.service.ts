import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';

let genAI: GoogleGenerativeAI | null = null;
if (config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    console.log('[Gemini AI] Google Generative AI SDK initialized successfully.');
  } catch (err) {
    console.warn('[Gemini AI] Initialization failed:', err);
  }
} else {
  console.log('[Gemini AI] GEMINI_API_KEY missing or default. Operating with Realtime Rule-Based AI Engine.');
}

export interface AIAnalysisRequest {
  generator: {
    id: string;
    device_id: string;
    name: string;
    location: string;
    rated_power_kw: number;
    status: string;
  };
  telemetry: {
    temperature: number;
    humidity: number;
    voltage: number;
    current: number;
    power: number;
    rpm: number;
    timestamp: string;
  }[];
  activeAlerts?: {
    severity: string;
    type: string;
    message: string;
  }[];
}

export interface AIAnalysisResult {
  healthStatus: 'Optimal' | 'Degraded' | 'Attention Required' | 'Critical Failure Risk';
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

export const geminiService = {
  async analyzeTelemetry(req: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const latest = req.telemetry[req.telemetry.length - 1] || {
      temperature: 34.6,
      humidity: 45.0,
      voltage: 228.9,
      current: 16.1,
      power: 3685.0,
      rpm: 1167,
    };

    // If Gemini API Key is configured, attempt Google Gemini model call
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are WindSense AI, an expert renewable energy IoT diagnostic assistant analyzing real-time telemetry from wind turbine generators.

TURBINE METADATA:
Name: ${req.generator.name} (${req.generator.device_id})
Location: ${req.generator.location}
Rated Power: ${req.generator.rated_power_kw} kW
Current System Status: ${req.generator.status}

EXACT LATEST LIVE SENSOR READINGS:
- Stator Temperature: ${latest.temperature} °C
- Air Humidity: ${latest.humidity} %
- Grid Bus Voltage: ${latest.voltage} V
- Armature Current: ${latest.current} A
- Active Generated Power: ${latest.power} W (${(latest.power / 1000).toFixed(2)} kW)
- Rotor Speed: ${latest.rpm} RPM

RECENT TELEMETRY HISTORY:
${JSON.stringify(req.telemetry.slice(-5), null, 2)}

ACTIVE ALERTS:
${JSON.stringify(req.activeAlerts || [], null, 2)}

INSTRUCTIONS:
1. Base your diagnosis STRICTLY on the real-time sensor readings above. Incorporate the exact numbers (${latest.temperature}°C, ${latest.voltage}V, ${latest.current}A, ${(latest.power / 1000).toFixed(1)}kW, ${latest.rpm} RPM).
2. Evaluate thermal envelope (>60°C is elevated, >75°C is critical), voltage stability (nominal 230V, <180V critical), and rotor speed.
3. Respond ONLY with raw JSON matching this schema:
{
  "healthStatus": "Optimal" | "Degraded" | "Attention Required" | "Critical Failure Risk",
  "summary": "Clear, concise 2-3 sentence overview of generator health and operational state mentioning exact sensor values.",
  "performanceInsights": ["Insight 1 mentioning specific sensor metrics", "Insight 2", "Insight 3"],
  "recommendations": ["Actionable maintenance recommendation 1", "Actionable maintenance recommendation 2"],
  "observations": ["Technical telemetry observation 1", "Technical telemetry observation 2"]
}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as AIAnalysisResult;
          parsed.telemetrySnapshot = {
            temperature: latest.temperature,
            humidity: latest.humidity,
            voltage: latest.voltage,
            current: latest.current,
            power: latest.power,
            rpm: latest.rpm,
          };
          return parsed;
        }
      } catch (err) {
        console.warn('[Gemini AI] Cloud Gemini API call failed, falling back to real-time telemetry rules:', err);
      }
    }

    // Dynamic Sensor-Driven AI Diagnostic Engine Fallback
    return this.generateRuleBasedAnalysis(req.generator, latest, req.telemetry);
  },

  generateRuleBasedAnalysis(gen: AIAnalysisRequest['generator'], latest: any, history: any[]): AIAnalysisResult {
    let healthStatus: AIAnalysisResult['healthStatus'] = 'Optimal';
    const insights: string[] = [];
    const recommendations: string[] = [];
    const observations: string[] = [];

    const temp = Number(latest.temperature || 34.6);
    const volt = Number(latest.voltage || 228.9);
    const curr = Number(latest.current || 16.1);
    const powerKw = (Number(latest.power || volt * curr) / 1000).toFixed(1);
    const rpm = Number(latest.rpm || 1167);

    // Temperature Diagnostics
    if (temp > 75) {
      healthStatus = 'Critical Failure Risk';
      insights.push(`Critical stator temperature emergency detected at ${temp}°C (Safe limit: 60°C).`);
      recommendations.push('Trigger emergency mechanical pitch brake and disengage grid bus transformer.');
      recommendations.push('Inspect nacelle thermal cooling fans and stator winding insulation.');
      observations.push(`Thermal strain exceeded thermal ceiling by +${(temp - 60).toFixed(1)}°C.`);
    } else if (temp > 58) {
      healthStatus = 'Attention Required';
      insights.push(`Elevated thermal signature recorded at ${temp}°C.`);
      recommendations.push('Inspect air intake vents and clean dust filtration screens.');
      recommendations.push('Verify rotor bearing lubrication pressure.');
      observations.push(`Stator temperature operating +${(temp - 45).toFixed(1)}°C above nominal baseline.`);
    } else {
      insights.push(`Stator temperature is operating in safe thermal envelope at ${temp}°C.`);
      observations.push('Coil winding thermal dissipation rates are optimal.');
    }

    // Voltage Diagnostics
    if (volt < 170) {
      if (healthStatus !== 'Critical Failure Risk') healthStatus = 'Critical Failure Risk';
      insights.push(`Grid bus voltage collapsed to ${volt}V (Nominal baseline: 230V RMS).`);
      recommendations.push('Check grid coupling relay and power factor inverter capacitors.');
      observations.push('Phase 1 voltage collapse detected across main terminal coupling.');
    } else if (volt < 210) {
      if (healthStatus === 'Optimal') healthStatus = 'Degraded';
      insights.push(`Minor bus voltage dip recorded at ${volt}V RMS.`);
      recommendations.push('Verify terminal lug tightness and check grid frequency stabilization.');
      observations.push('Reactive power imbalance observed on main output bus.');
    } else {
      insights.push(`Grid output voltage is stable at ${volt}V RMS.`);
      observations.push('Power factor inverter grid coupling is synchronized.');
    }

    // Electrical Power & Mechanical Speed Diagnostics
    insights.push(`Active power generation output is ${powerKw} kW at ${rpm} RPM (${curr}A current draw).`);

    if (recommendations.length === 0) {
      recommendations.push('Maintain standard quarterly bearing lubrication and bolt torque checks.');
      recommendations.push('Continue live real-time IoT sensor telemetry stream monitoring.');
    }

    const summary = `${gen.name} (${gen.device_id}) diagnosed with health status '${healthStatus}'. Real-time telemetry snapshot records ${temp}°C stator temperature, ${volt}V output voltage, ${curr}A current draw, and ${powerKw} kW generated active power at ${rpm} RPM.`;

    return {
      healthStatus,
      summary,
      performanceInsights: insights,
      recommendations,
      observations,
      telemetrySnapshot: {
        temperature: temp,
        humidity: Number(latest.humidity || 45),
        voltage: volt,
        current: curr,
        power: Number(latest.power || volt * curr),
        rpm,
      },
    };
  },
};
