import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env';
import generatorsRoutes from './routes/generators.routes';
import telemetryRoutes from './routes/telemetry.routes';
import alertsRoutes from './routes/alerts.routes';
import aiRoutes from './routes/ai.routes';

const app = express();

// Middleware
app.use(
  cors({
    origin: '*', // Allow connections from frontend dev server
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// API Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'WindSense AI Node/Express Backend',
    timestamp: new Date().toISOString(),
    mode: config.isDemoMode ? 'Standalone Simulator' : 'Supabase Cloud Connected',
    geminiStatus: config.geminiApiKey ? 'Configured' : 'Rule-Based Engine Fallback',
  });
});

// Route Mounts
app.use('/api/generators', generatorsRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/ai', aiRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Express Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

app.listen(config.port, () => {
  console.log(`\n⚡ WindSense AI Express Backend running on http://localhost:${config.port}`);
  console.log(`🔌 Mode: ${config.isDemoMode ? 'Standalone Simulator' : 'Supabase Cloud'}`);
  console.log(`🤖 Gemini AI: ${config.geminiApiKey ? 'API Active' : 'Rule Engine Active'}\n`);
});
