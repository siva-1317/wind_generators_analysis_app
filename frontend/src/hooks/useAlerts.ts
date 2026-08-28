import { useState, useEffect, useCallback } from 'react';
import { AlertRecord } from '../types';
import { apiService } from '../services/api';

export function useAlerts(pollIntervalMs = 5000) {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await apiService.getAlerts();
      setAlerts(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load alerts:', err);
      setError(err.message || 'Failed to fetch alerts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acknowledge = async (alertId: string, userId?: string) => {
    try {
      const updated = await apiService.acknowledgeAlert(alertId, userId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
      return updated;
    } catch (err: any) {
      console.error('Failed to acknowledge alert:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchAlerts, pollIntervalMs]);

  return { alerts, isLoading, error, acknowledge, refetch: fetchAlerts };
}
