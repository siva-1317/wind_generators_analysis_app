-- ========================================================
-- WindSense AI — Supabase PostgreSQL Database Schema
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS / PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WIND GENERATORS TABLE
CREATE TABLE IF NOT EXISTS public.wind_generators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  rated_power_kw NUMERIC(8,2) NOT NULL DEFAULT 50.00,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'warning', 'critical')),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TELEMETRY TABLE
CREATE TABLE IF NOT EXISTS public.telemetry (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  generator_id UUID NOT NULL REFERENCES public.wind_generators(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  temperature NUMERIC(5,2) NOT NULL, -- °C
  humidity NUMERIC(5,2) NOT NULL,    -- %
  voltage NUMERIC(6,2) NOT NULL,     -- V
  current NUMERIC(6,2) NOT NULL,     -- A
  power NUMERIC(8,2) GENERATED ALWAYS AS (voltage * current) STORED, -- Watts
  rpm NUMERIC(6,2) DEFAULT 0.00      -- Rotor RPM
);

-- Index telemetry by generator and timestamp for fast queries
CREATE INDEX IF NOT EXISTS idx_telemetry_gen_time ON public.telemetry(generator_id, timestamp DESC);

-- 4. ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generator_id UUID NOT NULL REFERENCES public.wind_generators(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_gen_severity ON public.alerts(generator_id, severity, acknowledged);

-- 5. AI ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generator_id UUID NOT NULL REFERENCES public.wind_generators(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  health_status TEXT NOT NULL CHECK (health_status IN ('Optimal', 'Degraded', 'Attention Required', 'Critical Failure Risk')),
  summary TEXT NOT NULL,
  performance_insights JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  observations JSONB NOT NULL DEFAULT '[]'::jsonb,
  telemetry_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_gen_time ON public.ai_analyses(generator_id, created_at DESC);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wind_generators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users read access
CREATE POLICY "Allow authenticated read users" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read wind_generators" ON public.wind_generators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read telemetry" ON public.telemetry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read alerts" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read ai_analyses" ON public.ai_analyses FOR SELECT TO authenticated USING (true);

-- Allow authenticated operators/admins to insert/update telemetry and alerts
CREATE POLICY "Allow admin write wind_generators" ON public.wind_generators FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow insert telemetry" ON public.telemetry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update alerts" ON public.alerts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow insert ai_analyses" ON public.ai_analyses FOR INSERT TO authenticated WITH CHECK (true);

-- ========================================================
-- SUPABASE REALTIME PUBLICATION
-- ========================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.wind_generators, 
    public.telemetry, 
    public.alerts, 
    public.ai_analyses;
COMMIT;
