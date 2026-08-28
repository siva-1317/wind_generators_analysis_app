import React, { useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Cpu, Plus, Copy, Check, Wifi, Server, ShieldAlert, Code, Zap } from 'lucide-react';

export const ESP32SetupPage: React.FC = () => {
  const { canManageDevices } = useAuth();

  // Form State
  const [deviceId, setDeviceId] = useState('ESP32-WIND-005');
  const [name, setName] = useState('Turbine Epsilon-5');
  const [location, setLocation] = useState('South Hill Ridge');
  const [ratedPowerKw, setRatedPowerKw] = useState(50.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Ingestion Endpoint URL
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const ingestEndpoint = `${backendUrl}/telemetry/ingest`;

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId || !name || !location) return;

    setIsSubmitting(true);
    try {
      await apiService.createGenerator({
        device_id: deviceId,
        name,
        location,
        rated_power_kw: ratedPowerKw,
      });
      setSuccessMsg(`Generator '${name}' (${deviceId}) registered successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Registration failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate ESP32 C++ Arduino Sketch Code snippet dynamically
  const generatedCppCode = `/*
 * WindSense AI — Physical ESP32 Telemetry Transmitter Sketch
 * Target Device ID: ${deviceId}
 * Ingestion Endpoint: ${ingestEndpoint}
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// 1. Wi-Fi Configuration
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// 2. WindSense Ingestion Endpoint
const char* serverUrl = "${ingestEndpoint}";

// 3. Sensor Hardware Pins
#define TEMP_PIN 4      // DHT11/DHT22 Temperature Pin
#define VOLT_PIN 35     // Voltage Sensor Pin (Divider)
#define CURR_PIN 34     // ACS712 Current Sensor Pin

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWi-Fi Connected! IP: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Read Sensors (Simulated / Analog Read Conversion)
    float temperature = 34.5 + (random(-10, 10) * 0.1);
    float humidity    = 45.0 + (random(-10, 10) * 0.2);
    float voltage     = 230.0 + (random(-20, 20) * 0.1);
    float current     = 18.2 + (random(-10, 10) * 0.1);
    int rpm           = current * 72;

    // Construct JSON Payload
    StaticJsonDocument<256> doc;
    doc["device_id"]   = "${deviceId}";
    doc["temperature"] = temperature;
    doc["humidity"]    = humidity;
    doc["voltage"]     = voltage;
    doc["current"]     = current;
    doc["rpm"]         = rpm;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    // Send HTTP POST to WindSense AI Backend
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      Serial.printf("[WindSense] Telemetry sent! HTTP Response: %d\\n", httpResponseCode);
    } else {
      Serial.printf("[WindSense] HTTP Error: %s\\n", http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  }
  
  delay(3000); // Transmission Frequency: Every 3 Seconds
}
`;

  const copyToClipboard = (text: string, type: 'url' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="glass-card rounded-2xl p-6 border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Cpu className="w-5 h-5 fill-current" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">ESP32 Device Registration & Setup Hub</h1>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Register new wind turbine devices, inspect the server HTTP ingestion address, and generate ready-to-flash C++ sketch code for your physical ESP32 microcontrollers.
          </p>
        </div>
      </div>

      {/* 1. ESP32 INGESTION ENDPOINT ADDRESS CARD */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            ESP32 Ingestion API Endpoint Address
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
            HTTP POST Payload
          </span>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
          <span className="text-slate-400 shrink-0 font-sans font-bold uppercase">Target URL:</span>
          <span className="flex-1 font-bold select-all">{ingestEndpoint}</span>
          <button
            onClick={() => copyToClipboard(ingestEndpoint, 'url')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition shrink-0"
            title="Copy API URL"
          >
            {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. REGISTER NEW WIND GENERATOR FORM */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" />
          Register New Wind Turbine Unit
        </h3>

        {!canManageDevices && (
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Admin permission required to register hardware devices. (Currently logged in as non-admin role)</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegisterDevice} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Device ID</label>
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="ESP32-WIND-005"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Turbine Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Turbine Epsilon-5"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deployment Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="South Hill Ridge Sector D"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Rated Power Capacity (kW)</label>
            <input
              type="number"
              value={ratedPowerKw}
              onChange={(e) => setRatedPowerKw(Number(e.target.value))}
              placeholder="50.0"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !canManageDevices}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-md transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register Turbine Device</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. GENERATED ESP32 C++ SKETCH CODE */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Code className="w-4 h-4 text-amber-400" />
            ESP32 Arduino C++ Sketch Generator
          </h3>

          <button
            onClick={() => copyToClipboard(generatedCppCode, 'code')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Sketch Code</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-96 leading-relaxed select-all">
            {generatedCppCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
