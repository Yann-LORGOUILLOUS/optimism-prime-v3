"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { ReliquaryApplicationService, ReliquaryDisplayData } from "@/application/services";
import { ReliquaryBlockchainRepository } from "@/infrastructure/blockchain/repositories";
import { ContractType, ReliquaryRawData, RelicRawData } from "@/domain/reliquary/repositories";
import { OPTIMISM_CHAIN_ID, REFRESH_INTERVAL_MS } from "@/shared/constants/time";
import { UI_LIMITS } from "@/shared/constants/ui";

type UseReliquaryServiceResult = {
  data: ReliquaryDisplayData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  loadAllRelics: () => void;
};

export function useReliquaryService(
  version: 1 | 2,
  contractType: ContractType = "reliquary"
): UseReliquaryServiceResult {
  const { address: userAddress, chain } = useAccount();
  const publicClient = usePublicClient();

  const [data, setData] = useState<ReliquaryDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allRelicsLoading, setAllRelicsLoading] = useState(false);
  const [allRelicsLoaded, setAllRelicsLoaded] = useState(false);

  const isInitialFetch = useRef(true);
  const previousVersion = useRef(version);
  const previousContractType = useRef(contractType);
  const rawDataRef = useRef<ReliquaryRawData | null>(null);
  const allRelicsRef = useRef<RelicRawData[]>([]);

  const isOptimism = chain?.id === OPTIMISM_CHAIN_ID;

  const service = useMemo(() => {
    if (!publicClient) return null;
    const repository = new ReliquaryBlockchainRepository(publicClient);
    return new ReliquaryApplicationService(repository);
  }, [publicClient]);

  const fetchData = useCallback(
    async (showLoading: boolean = true) => {
      if (!service || !isOptimism) return;

      if (showLoading) setIsLoading(true);
      setError(null);

      try {
        const displayData = await service.getReliquaryDisplayData(
          { version, contractType },
          userAddress as `0x${string}` | undefined
        );

        rawDataRef.current = {
          address: displayData.address as `0x${string}`,
          rewardToken: {
            address: "0x0" as `0x${string}`,
            name: "",
            symbol: displayData.rewardTokenSymbol,
            decimals: displayData.rewardTokenDecimals,
            balance: BigInt(0),
          },
          emissionRate: BigInt(0),
          totalAllocPoint: 0,
          pools: [],
          oppPriceUsd: displayData.oppPriceUsd,
          rewardTokenPriceUsd: 0,
        };

        const finalData: ReliquaryDisplayData = {
          ...displayData,
          allRelics: allRelicsRef.current.length > 0 
            ? service.transformToDisplayData(
                rawDataRef.current,
                null,
                allRelicsRef.current,
                allRelicsLoading,
                allRelicsLoaded
              ).allRelics
            : [],
          allRelicsLoading,
          allRelicsLoaded,
        };

        setData(finalData);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        setError(message);
      } finally {
        if (showLoading) {
          setIsLoading(false);
          isInitialFetch.current = false;
        }
      }
    },
    [service, isOptimism, version, contractType, userAddress, allRelicsLoading, allRelicsLoaded]
  );

  const loadAllRelics = useCallback(async () => {
    if (!service || !data || allRelicsLoading || allRelicsLoaded) return;

    setAllRelicsLoading(true);
    setError(null);

    try {
      const relics = await service.loadAllRelics(
        data.address as `0x${string}`,
        UI_LIMITS.maxRelicsToLoad
      );
      allRelicsRef.current = relics;
      setAllRelicsLoaded(true);

      setData((prev) => {
        if (!prev || !rawDataRef.current) return prev;
        
        const updatedData = service.transformToDisplayData(
          rawDataRef.current,
          null,
          relics,
          false,
          true
        );
        
        return {
          ...prev,
          allRelics: updatedData.allRelics,
          allRelicsLoading: false,
          allRelicsLoaded: true,
        };
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load relics";
      setError(message);
    } finally {
      setAllRelicsLoading(false);
    }
  }, [service, data, allRelicsLoading, allRelicsLoaded]);

  useEffect(() => {
    const versionChanged = previousVersion.current !== version;
    const contractTypeChanged = previousContractType.current !== contractType;

    if (versionChanged || contractTypeChanged) {
      isInitialFetch.current = true;
      setData(null);
      setAllRelicsLoaded(false);
      rawDataRef.current = null;
      allRelicsRef.current = [];
      previousVersion.current = version;
      previousContractType.current = contractType;
    }
    fetchData(isInitialFetch.current);
  }, [fetchData, version, contractType]);

  useEffect(() => {
    if (!isOptimism || !data) return;

    const intervalId = setInterval(() => {
      fetchData(false);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchData, isOptimism, data]);

  const refetch = useCallback(() => {
    setAllRelicsLoaded(false);
    allRelicsRef.current = [];
    fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, refetch, loadAllRelics };
}
