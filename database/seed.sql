-- ========================================================
-- WindSense AI — Seed Data Migration
-- ========================================================

-- Insert Sample Wind Generators
INSERT INTO public.wind_generators (id, device_id, name, location, description, rated_power_kw, status, last_seen)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'ESP32-WIND-001', 'Turbine Alpha-1', 'North Ridge Sector A', 'Primary 75kW Direct-Drive Campus Turbine', 75.00, 'online', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'ESP32-WIND-002', 'Turbine Beta-2', 'Campus Eco-Park East', '50kW Auxiliary Wind Generator', 50.00, 'warning', NOW() - INTERVAL '2 minutes'),
  ('33333333-3333-3333-3333-333333333333', 'ESP32-WIND-003', 'Turbine Gamma-3', 'Coastal Hill Station', '100kW High-Efficiency Offshore Model', 100.00, 'online', NOW()),
  ('44444444-4444-4444-4444-444444444444', 'ESP32-WIND-004', 'Turbine Delta-4', 'West Ridge Sector C', '50kW Experimental Pitch-Control Unit', 50.00, 'critical', NOW() - INTERVAL '15 minutes')
ON CONFLICT (device_id) DO NOTHING;

-- Insert Telemetry Snapshots (Alpha-1)
INSERT INTO public.telemetry (generator_id, timestamp, temperature, humidity, voltage, current, rpm)
VALUES
  ('11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 minutes', 34.2, 45.1, 230.5, 18.2, 1420),
  ('11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '20 minutes', 35.0, 44.8, 231.0, 18.8, 1435),
  ('11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '10 minutes', 35.8, 44.2, 230.2, 19.1, 1450),
  ('11111111-1111-1111-1111-111111111111', NOW(), 36.1, 43.9, 231.8, 19.5, 1462);

-- Insert Telemetry Snapshots (Beta-2 - High Temp Warning)
INSERT INTO public.telemetry (generator_id, timestamp, temperature, humidity, voltage, current, rpm)
VALUES
  ('22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '30 minutes', 52.1, 58.4, 218.4, 24.1, 1120),
  ('22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '20 minutes', 56.4, 60.1, 215.2, 25.4, 1150),
  ('22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '10 minutes', 61.2, 62.0, 212.0, 26.8, 1180),
  ('22222222-2222-2222-2222-222222222222', NOW(), 64.8, 63.5, 209.5, 27.9, 1205);

-- Insert Telemetry Snapshots (Gamma-3)
INSERT INTO public.telemetry (generator_id, timestamp, temperature, humidity, voltage, current, rpm)
VALUES
  ('33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '30 minutes', 28.4, 52.0, 240.1, 32.4, 1780),
  ('33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '15 minutes', 29.1, 51.5, 239.8, 33.1, 1795),
  ('33333333-3333-3333-3333-333333333333', NOW(), 29.5, 51.0, 240.5, 33.8, 1810);

-- Insert Telemetry Snapshots (Delta-4 - Voltage Drop Critical)
INSERT INTO public.telemetry (generator_id, timestamp, temperature, humidity, voltage, current, rpm)
VALUES
  ('44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '30 minutes', 41.0, 68.2, 185.0, 8.2, 620),
  ('44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '15 minutes', 44.5, 71.0, 162.4, 4.1, 310),
  ('44444444-4444-4444-4444-444444444444', NOW(), 48.2, 74.2, 140.1, 1.2, 90);

-- Insert Sample Alerts
INSERT INTO public.alerts (generator_id, severity, type, message, timestamp, acknowledged)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'warning', 'High Temperature Warning', 'Stator coil temperature exceeded 64°C safety threshold.', NOW() - INTERVAL '10 minutes', false),
  ('44444444-4444-4444-4444-444444444444', 'critical', 'Critical Voltage Drop', 'Grid output voltage dropped below 150V nominal range. Automatic pitch braking activated.', NOW() - INTERVAL '25 minutes', false),
  ('11111111-1111-1111-1111-111111111111', 'info', 'Routine Maintenance Due', 'Turbine Alpha-1 scheduled for quarterly mechanical inspect.', NOW() - INTERVAL '2 days', true);

-- Insert Sample AI Analysis
INSERT INTO public.ai_analyses (generator_id, health_status, summary, performance_insights, recommendations, observations, telemetry_snapshot)
VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    'Attention Required',
    'Turbine Beta-2 is displaying elevated internal temperatures (64.8°C) paired with increasing current draw (27.9A) and slight voltage sag. Cooling airflow degradation or mechanical bearing friction suspected.',
    '["Temperature increased by +12.7°C over 30 minutes", "Current draw increased 15.7% above baseline", "Voltage stability compromised at 209.5V"]',
    '["Inspect cooling duct intake filters for debris blockages", "Perform bearing vibration inspection", "Temporarily de-rate power output by 20% to manage heat generation"]',
    '["Operating temperature trend exceeds standard thermal envelope", "Rotor speed remains steady at 1205 RPM"]',
    '{"temperature": 64.8, "humidity": 63.5, "voltage": 209.5, "current": 27.9}'
  );
