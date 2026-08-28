import { useState, useEffect, useCallback } from 'react';
import { WindGenerator } from '../types';
import { apiService } from '../services/api';

export function useGenerators(pollIntervalMs = 5000) {
  const [generators, setGenerators] = useState<WindGenerator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGenerators = useCallback(async () => {
    try {
      const data = await apiService.getGenerators();
      setGenerators(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load generators:', err);
      setError(err.message || 'Failed to fetch generators');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGenerators();
    const interval = setInterval(fetchGenerators, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchGenerators, pollIntervalMs]);

  return { generators, isLoading, error, refetch: fetchGenerators };
}
