'use client';

import { useState, useEffect, useCallback } from 'react';

const PAIR_ADDRESS = '0x62191c893df8d26ac295ba1274a00975dc07190c';
const API_URL = `https://api.dexscreener.com/latest/dex/pairs/optimism/${PAIR_ADDRESS}`;
const REFRESH_INTERVAL = 30000;

type TokenStats = {
  priceUsd: string;
  volume24h: string;
  marketCap: string;
};

export function useTokenStats() {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.pair) {
        setStats({
          priceUsd: data.pair.priceUsd || '0',
          volume24h: data.pair.volume?.h24?.toString() || '0',
          marketCap: data.pair.fdv?.toString() || '0',
        });
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch token stats');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}
