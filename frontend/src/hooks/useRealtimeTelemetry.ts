import { useState, useEffect, useCallback } from 'react';
import { TelemetryRecord } from '../types';
import { apiService } from '../services/api';
import { supabase } from '../lib/supabase';

export function useRealtimeTelemetry(generatorId?: string, pollIntervalMs = 3000) {
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryRecord[]>([]);
  const [latestMap, setLatestMap] = useState<Record<string, TelemetryRecord>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      if (generatorId) {
        const history = await apiService.getTelemetryByGenerator(generatorId, 50);
        setTelemetryHistory(history || []);
      } else {
        const latest = await apiService.getLatestTelemetry();
        setLatestMap(latest || {});
      }
      setError(null);
      setIsConnected(true);
    } catch (err: any) {
      console.warn('Failed to load telemetry data:', err);
      setError(err.message || 'Telemetry connection error');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [generatorId]);

  useEffect(() => {
    fetchInitialData();

    // Setup Supabase Realtime websocket with unique channel ID
    let channel: any = null;
    if (supabase) {
      try {
        const channelName = `telemetry-${generatorId || 'all'}-${Math.random().toString(36).substring(2, 9)}`;
        channel = supabase.channel(channelName);
        
        channel
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'telemetry' },
            (payload: any) => {
              if (payload?.new) {
                const newRecord = payload.new as TelemetryRecord;
                if (generatorId) {
                  if (newRecord.generator_id === generatorId) {
                    setTelemetryHistory((prev) => [...(prev || []).slice(-49), newRecord]);
                  }
                } else {
                  setLatestMap((prev) => ({ ...(prev || {}), [newRecord.generator_id]: newRecord }));
                }
              }
            }
          )
          .subscribe((status: string) => {
            setIsConnected(status === 'SUBSCRIBED');
          });
      } catch (wsErr) {
        console.warn('[Realtime WS Warning] Failed to subscribe to channel:', wsErr);
      }
    }

    // Polling fallback mechanism
    const interval = setInterval(async () => {
      try {
        if (generatorId) {
          const fresh = await apiService.getTelemetryByGenerator(generatorId, 50);
          if (fresh && Array.isArray(fresh)) {
            setTelemetryHistory(fresh);
          }
        } else {
          const freshMap = await apiService.getLatestTelemetry();
          if (freshMap && typeof freshMap === 'object') {
            setLatestMap(freshMap);
          }
        }
        setIsConnected(true);
      } catch (e) {
        setIsConnected(false);
      }
    }, pollIntervalMs);

    return () => {
      clearInterval(interval);
      if (channel && supabase) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          // Ignore unmount cleanup errors
        }
      }
    };
  }, [generatorId, fetchInitialData, pollIntervalMs]);

  return { telemetryHistory, latestMap, isLoading, isConnected, error, refetch: fetchInitialData };
}
