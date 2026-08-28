# WindSense AI — Intelligent Telemetry Dashboard for Renewable Energy Systems

WindSense AI is an enterprise-grade IoT telemetry and AI analytics monitoring system designed for wind turbine generators.

## 🚀 Features

- **Real-Time Telemetry Streaming**: Monitor Temperature (°C), Humidity (%), Voltage (V), Current (A), Power (W), and RPM via Supabase Realtime & WebSockets.
- **AI Diagnostics & Advisory Engine**: Powered by Google Gemini AI to evaluate generator telemetry, detect anomalies, calculate health status, and generate actionable maintenance recommendations.
- **Centralized Fleet Management**: Manage wind turbines, track last-seen communication, filter by status (`online`, `offline`, `warning`, `critical`), and review location coordinates.
- **Interactive Telemetry Analytics**: Flexible historical data exploration (1h, 6h, 24h, 7d, custom ranges) with interactive metric charts and CSV/JSON export.
- **Alert Management System**: Real-time notifications for critical alarms, acknowledging capabilities, and severity categorizations (`info`, `warning`, `critical`).
- **Responsive Industrial Visual Design**: Tailored modern dark/light UI built with React, Vite, TypeScript, Tailwind CSS, glassmorphism aesthetics, and mobile navigation support.
- **Built-in Standalone Demo Mode**: Works out of the box with continuous telemetry simulation even without physical ESP32 hardware or live cloud keys.

## 📂 Project Architecture

```text
wind_app/
├── backend/            # Express Node.js + TypeScript API & Gemini AI Service
│   ├── src/
│   │   ├── config/     # Environment & config validation
│   │   ├── controllers/# API endpoint logic (AI, Generators, Telemetry, Alerts)
│   │   ├── routes/     # Express routers
│   │   └── services/   # Gemini SDK, Supabase Admin, and Telemetry Simulator
│   └── package.json
├── frontend/           # Vite + React 18 + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/ # AppShell, Navigation, Recharts wrappers, Status badges, AI cards
│   │   ├── contexts/   # AuthContext & Standalone Demo Mode state
│   │   ├── hooks/      # Realtime telemetry & generator data hooks
│   │   ├── pages/      # Dashboard, Generators, Detail, Telemetry, Analytics, Alerts, AI Insights, Settings, Profile
│   │   ├── services/   # Backend API client & Supabase JS client
│   │   └── types/      # TypeScript interfaces
│   └── package.json
├── database/           # PostgreSQL Database DDL & Seed Scripts
│   ├── schema.sql      # Database DDL with RLS & Realtime publication setup
│   └── seed.sql        # Demo wind generators, telemetry snapshots, and alerts
└── README.md
```

## 🛠️ Quick Start

### 1. Installation
Install dependencies for both frontend and backend:
```bash
npm run install:all
```

### 2. Environment Configuration
Copy `.env.example` templates in both `backend` and `frontend`:
- `backend/.env`
- `frontend/.env`

#### Backend (`backend/.env`):
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Running Locally
Run both frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend UI**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🔒 Security & Architecture Standards

- **Server-Side AI Key Enforcement**: Gemini API keys are strictly secured within the Node/Express backend and never exposed to client browsers.
- **Supabase Row Level Security**: Database policies ensure only authenticated users access generator telemetry.
- **Stand-Alone Telemetry Simulator**: Built-in fallback system streams simulated ESP32 sensor pulses if cloud credentials are absent during development.
