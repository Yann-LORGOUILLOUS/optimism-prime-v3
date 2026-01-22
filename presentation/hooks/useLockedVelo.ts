'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { optimism } from 'viem/chains';

const VOTING_ESCROW_CONTRACT = '0xFAf8FD17D9840595845582fCB047DF13f006787d';
const VE_NFT_IDS = [2647, 2648, 2649];
const REFRESH_INTERVAL = 30000;

const VOTING_ESCROW_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'locked',
    outputs: [
      { internalType: 'int128', name: 'amount', type: 'int128' },
      { internalType: 'uint256', name: 'end', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function useLockedVelo() {
  const [lockedVelo, setLockedVelo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLockedVelo = useCallback(async () => {
    try {
      const client = createPublicClient({
        chain: optimism,
        transport: http(),
      });

      let totalVelo = BigInt(0);

      for (const nftId of VE_NFT_IDS) {
        const result = await client.readContract({
          address: VOTING_ESCROW_CONTRACT,
          abi: VOTING_ESCROW_ABI,
          functionName: 'locked',
          args: [BigInt(nftId)],
        });

        const amount = BigInt(result[0]);
        totalVelo += amount;
      }

      const formatted = formatUnits(totalVelo, 18);
      const rounded = Number(formatted).toLocaleString('en-US', {
        maximumFractionDigits: 0,
      });

      setLockedVelo(rounded);
      setError(null);
    } catch (err) {
      setError('Failed to fetch locked VELO');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLockedVelo();
    const interval = setInterval(fetchLockedVelo, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLockedVelo]);

  return { lockedVelo, isLoading, error, refetch: fetchLockedVelo };
}
