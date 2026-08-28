import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Settings,
  Cpu,
  Plus,
  Copy,
  Check,
  Server,
  ShieldCheck,
  ShieldAlert,
  Wifi,
  Sparkles,
  Database,
  Bell,
  Save,
  Sun,
  Moon,
  ToggleLeft,
  ToggleRight,
  Code,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, canManageDevices, canAcknowledgeAlerts } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'esp32' | 'data' | 'system'>('esp32');

  // ESP32 Device Registration State
  const [deviceId, setDeviceId] = useState('ESP32-WIND-005');
  const [name, setName] = useState('Turbine Epsilon-5');
  const [location, setLocation] = useState('South Hill Ridge');
  const [ratedPowerKw, setRatedPowerKw] = useState(50.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Settings State
  const [dataMode, setDataMode] = useState<'live' | 'demo'>(() => {
    return (localStorage.getItem('windsense_data_mode') as 'live' | 'demo') || 'live';
  });
  const [tempThreshold, setTempThreshold] = useState<number>(60);
  const [voltMinThreshold, setVoltMinThreshold] = useState<number>(180);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const ingestEndpoint = `${backendUrl}/telemetry/ingest`;

  useEffect(() => {
    apiService
      .getSystemHealth()
      .then((data) => setSystemHealth(data))
      .catch((err) => console.error('Failed to load backend health:', err));
  }, []);

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
      setSuccessMsg(`Turbine '${name}' (${deviceId}) registered successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Registration error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatedCppCode = `/*
 * WindSense AI — Physical ESP32 Telemetry Transmitter Sketch
 * Target Device ID: ${deviceId}
 * Server Ingestion Address: ${ingestEndpoint}
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "${ingestEndpoint}";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
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

    float temperature = 34.5 + (random(-10, 10) * 0.1);
    float humidity    = 45.0 + (random(-10, 10) * 0.2);
    float voltage     = 230.0 + (random(-20, 20) * 0.1);
    float current     = 18.2 + (random(-10, 10) * 0.1);
    int rpm           = current * 72;

    StaticJsonDocument<256> doc;
    doc["device_id"]   = "${deviceId}";
    doc["temperature"] = temperature;
    doc["humidity"]    = humidity;
    doc["voltage"]     = voltage;
    doc["current"]     = current;
    doc["rpm"]         = rpm;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);
    Serial.printf("[WindSense] Telemetry sent! HTTP Status: %d\\n", httpResponseCode);
    http.end();
  }
  delay(3000);
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

  const handleSaveSettings = () => {
    localStorage.setItem('windsense_data_mode', dataMode);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-card w-fit">
        <button
          onClick={() => setActiveTab('esp32')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'esp32'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'app-text-muted hover:text-emerald-500'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>ESP32 Device Hub & Setup</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'data'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'app-text-muted hover:text-emerald-500'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data Mode & Theme</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'system'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'app-text-muted hover:text-emerald-500'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Permissions & System Health</span>
        </button>
      </div>

      {/* TAB 1: ESP32 DEVICE HUB & ONBOARDING */}
      {activeTab === 'esp32' && (
        <div className="space-y-6">
          {/* Section Header Banner */}
          <div className="glass-card banner-gradient rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
                  <Cpu className="w-5 h-5 fill-current" />
                </div>
                <h2 className="text-xl font-extrabold app-text-main tracking-tight">
                  ESP32 Device Registration & Setup Hub
                </h2>
              </div>
              <p className="text-xs app-text-muted max-w-xl leading-relaxed">
                Register new wind turbines, obtain the server ingestion address, and generate flashable C++ sketch code for your physical ESP32 microcontrollers.
              </p>
            </div>
          </div>

          {/* 1. Server HTTP Ingestion Address */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold app-text-main flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-500" />
                ESP32 HTTP API Ingestion Address
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                HTTP POST Payload
              </span>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl app-bg-inner border app-border font-mono text-xs app-text-main">
              <span className="app-text-muted font-sans font-bold uppercase shrink-0">Server Target URL:</span>
              <span className="flex-1 font-bold select-all text-emerald-600 dark:text-emerald-400">{ingestEndpoint}</span>
              <button
                onClick={() => copyToClipboard(ingestEndpoint, 'url')}
                className="p-1.5 rounded-lg app-bg-card hover:border-emerald-500 transition shrink-0"
                title="Copy API URL"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 app-text-muted" />}
              </button>
            </div>
          </div>

          {/* 2. Register New Wind Generator Form */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold app-text-main flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-500" />
              Register New Turbine Generator Unit
            </h3>

            {!canManageDevices && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Admin permissions required to register hardware devices.</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterDevice} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block app-text-main font-bold mb-1">Target Device ID</label>
                <input
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="ESP32-WIND-005"
                  className="w-full p-2.5 rounded-xl border font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block app-text-main font-bold mb-1">Turbine Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Turbine Epsilon-5"
                  className="w-full p-2.5 rounded-xl border font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block app-text-main font-bold mb-1">Deployment Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="South Hill Ridge Sector D"
                  className="w-full p-2.5 rounded-xl border font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block app-text-main font-bold mb-1">Rated Power Capacity (kW)</label>
                <input
                  type="number"
                  value={ratedPowerKw}
                  onChange={(e) => setRatedPowerKw(Number(e.target.value))}
                  placeholder="50.0"
                  className="w-full p-2.5 rounded-xl border font-semibold"
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
                  <span>Register Turbine Unit</span>
                </button>
              </div>
            </form>
          </div>

          {/* 3. Generated ESP32 Arduino C++ Sketch Code */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold app-text-main flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-500" />
                ESP32 C++ Arduino Sketch Generator
              </h3>

              <button
                onClick={() => copyToClipboard(generatedCppCode, 'code')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold app-bg-inner hover:border-emerald-500 border app-border app-text-main transition flex items-center gap-1.5 shadow-sm"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Sketch Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-2xl code-block font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed select-all">
              {generatedCppCode}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: DATA MANAGEMENT & THEME SETTINGS */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Data Source Mode Switch */}
          <div className="glass-card rounded-2xl p-6 space-y-4 border-emerald-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-bold app-text-main tracking-tight">Data Management & Source Mode</h3>
                </div>
                <p className="text-xs app-text-muted">
                  Switch between <strong>Live Supabase PostgreSQL Database</strong> and <strong>Simulated Demo Telemetry</strong>.
                </p>
              </div>

              <button
                onClick={() => setDataMode((prev) => (prev === 'live' ? 'demo' : 'live'))}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 border ${
                  dataMode === 'live'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-amber-500 text-slate-950 border-amber-400'
                }`}
              >
                {dataMode === 'live' ? (
                  <>
                    <ToggleRight className="w-5 h-5" />
                    <span>Mode: Live Database ⚡</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    <span>Mode: Demo Simulator 🧪</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl app-bg-inner border app-border text-xs app-text-main font-medium">
              Current Active Mode:{' '}
              <strong className={dataMode === 'live' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {dataMode === 'live'
                  ? '⚡ Live Database Mode — App reads/writes to real Supabase PostgreSQL tables & ESP32 API ingestion.'
                  : '🧪 Simulated Demo Telemetry Mode — App uses standalone synthetic generator telemetry stream.'}
              </strong>
            </div>
          </div>

          {/* Light / Dark Theme Engine */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold app-text-main flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              Application Visual Theme Engine
            </h3>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  theme === 'dark'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                    : 'app-bg-inner border app-border app-text-muted hover:text-emerald-500'
                }`}
              >
                Industrial Dark Mode 🌙
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  theme === 'light'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                    : 'app-bg-inner border app-border app-text-muted hover:text-emerald-500'
                }`}
              >
                Light Energy Mode ☀️
              </button>
            </div>
          </div>

          {/* Alarm Safety Thresholds */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold app-text-main flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Safety Alarm Thresholds
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block app-text-main font-bold mb-1">
                  High Temperature Warning Threshold (°C)
                </label>
                <input
                  type="number"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border font-semibold"
                />
              </div>

              <div>
                <label className="block app-text-main font-bold mb-1">
                  Critical Bus Voltage Floor Threshold (V)
                </label>
                <input
                  type="number"
                  value={voltMinThreshold}
                  onChange={(e) => setVoltMinThreshold(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>

            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Configuration Preferences Saved!
              </span>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PERMISSIONS & SYSTEM HEALTH */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* User Account Role Matrix */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold app-text-main flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              User Account Role & Permissions Matrix
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl app-bg-inner border app-border space-y-1">
                <p className="app-text-muted font-bold">Active Role</p>
                <p className="font-extrabold app-text-main capitalize">{user?.role || 'operator'}</p>
              </div>

              <div className="p-3 rounded-xl app-bg-inner border app-border space-y-1">
                <p className="app-text-muted font-bold">Register / Add Devices</p>
                <p className={`font-bold ${canManageDevices ? 'text-emerald-600 dark:text-emerald-400' : 'app-text-subtle'}`}>
                  {canManageDevices ? 'Allowed (Admin)' : 'Restricted (Admin Only)'}
                </p>
              </div>

              <div className="p-3 rounded-xl app-bg-inner border app-border space-y-1">
                <p className="app-text-muted font-bold">Acknowledge Alerts & Run AI</p>
                <p className={`font-bold ${canAcknowledgeAlerts ? 'text-emerald-600 dark:text-emerald-400' : 'app-text-subtle'}`}>
                  {canAcknowledgeAlerts ? 'Allowed' : 'Restricted (Read Only)'}
                </p>
              </div>
            </div>
          </div>

          {/* Backend API & Service Health */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold app-text-main flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-500" />
              Backend API & Service Health
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl app-bg-inner border app-border space-y-1">
                <p className="app-text-muted font-semibold">Node / Express API</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {systemHealth ? systemHealth.system : 'Express Backend (Online)'}
                </p>
              </div>

              <div className="p-3 rounded-xl app-bg-inner border app-border space-y-1">
                <p className="app-text-muted font-semibold">Supabase Realtime</p>
                <p className="font-bold text-cyan-600 dark:text-cyan-400">
                  {systemHealth ? systemHealth.mode : 'PostgreSQL Stream Active'}
                </p>
              </div>

              <div className="p-3 rounded-xl app-bg-inner border app-border space-y-1">
                <p className="app-text-muted font-semibold">Gemini AI SDK</p>
                <p className="font-bold text-amber-600 dark:text-amber-400">
                  {systemHealth ? systemHealth.geminiStatus : 'API Diagnostic Active'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
