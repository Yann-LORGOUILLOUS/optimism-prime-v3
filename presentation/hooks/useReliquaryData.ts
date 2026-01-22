"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import {
  readReliquaryData,
  readUserReliquaryData,
  readAllRelics,
  ReliquaryData as RawReliquaryData,
  UserReliquaryData as RawUserData,
  PoolData as RawPoolData,
  RelicData as RawRelicData,
} from "@/infrastructure/blockchain/services/ReliquaryReader";
import { TokenAmount } from "@/domain/reliquary/value-objects/TokenAmount";
import { OPTIMISM_CHAIN_ID } from "@/shared/constants/time";
import { ContractType } from "@/infrastructure/config/addresses";

const REFRESH_INTERVAL_MS = 30000;
const SECONDS_PER_YEAR = 31536000;
const SECONDS_PER_WEEK = 604800;

export type LevelDisplayData = {
  level: number;
  requiredMaturity: number;
  multiplier: number;
  tvlUsd: number;
  apr: number;
  allocShare: number;
  rewardRate: number;
  rewardRateUsd: number;
  weeklyRewardRate: number;
  weeklyRewardRateUsd: number;
};

export type PoolDisplayData = {
  index: number;
  displayName: string;
  shortName: string;
  url: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  allocPoint: number;
  allocShare: number;
  tvlUsd: number;
  averageApr: number;
  levels: LevelDisplayData[];
  isActive: boolean;
};

export type RelicDisplayData = {
  id: number;
  poolId: number;
  poolName: string;
  poolUrl: string;
  amount: TokenAmount;
  amountUsd: number;
  pendingReward: TokenAmount;
  pendingRewardUsd: number;
  level: number;
  maxLevel: number;
  multiplier: number;
  maturitySeconds: number;
  secondsToNextLevel: number;
  apr: number;
  canClaim: boolean;
  canLevelUp: boolean;
};

export type ReliquaryDisplayData = {
  address: string;
  rewardTokenSymbol: string;
  rewardTokenDecimals: number;
  oppPriceUsd: number;
  tvlUsd: number;
  averageApr: number;
  weeklyRewardRate: number;
  weeklyRewardRateUsd: number;
  pools: PoolDisplayData[];
  userRelics: RelicDisplayData[];
  totalUserDepositUsd: number;
  totalUserPendingRewards: TokenAmount;
  totalUserPendingRewardsUsd: number;
  userTokenBalances: Record<string, TokenAmount>;
  userTokenAllowances: Record<string, TokenAmount>;
  allRelics: RelicDisplayData[];
  allRelicsLoading: boolean;
  allRelicsLoaded: boolean;
};

type UseReliquaryDataResult = {
  data: ReliquaryDisplayData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  loadAllRelics: () => void;
};

export function useReliquaryData(
  version: 1 | 2,
  contractType: ContractType = "reliquary"
): UseReliquaryDataResult {
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
  const rawDataRef = useRef<RawReliquaryData | null>(null);
  const allRelicsRef = useRef<RawRelicData[]>([]);

  const isOptimism = chain?.id === OPTIMISM_CHAIN_ID;

  const fetchData = useCallback(
    async (showLoading: boolean = true) => {
      if (!publicClient || !isOptimism) return;

      if (showLoading) setIsLoading(true);
      setError(null);

      try {
        const rawData = await readReliquaryData(publicClient, version, contractType);
        rawDataRef.current = rawData;

        const userData = userAddress
          ? await readUserReliquaryData(publicClient, rawData.address, userAddress, rawData.pools)
          : null;

        const display = transformToDisplayData(
          rawData,
          userData,
          allRelicsRef.current,
          allRelicsLoading,
          allRelicsLoaded
        );

        setData(display);
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
    [publicClient, isOptimism, version, contractType, userAddress, allRelicsLoading, allRelicsLoaded]
  );

  const loadAllRelics = useCallback(async () => {
    if (!publicClient || !rawDataRef.current || allRelicsLoading || allRelicsLoaded) return;

    setAllRelicsLoading(true);
    setError(null);

    try {
      const relics = await readAllRelics(publicClient, rawDataRef.current.address, 150);
      allRelicsRef.current = relics;
      setAllRelicsLoaded(true);

      const userData = userAddress
        ? await readUserReliquaryData(publicClient, rawDataRef.current.address, userAddress, rawDataRef.current.pools)
        : null;

      const display = transformToDisplayData(rawDataRef.current, userData, relics, false, true);

      setData(display);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load relics";
      setError(message);
    } finally {
      setAllRelicsLoading(false);
    }
  }, [publicClient, userAddress, allRelicsLoading, allRelicsLoaded]);

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

function transformToDisplayData(
  raw: RawReliquaryData,
  userData: RawUserData | null,
  allRelicsRaw: RawRelicData[],
  allRelicsLoading: boolean,
  allRelicsLoaded: boolean
): ReliquaryDisplayData {
  const { rewardToken, emissionRate, totalAllocPoint, pools, oppPriceUsd, rewardTokenPriceUsd, address } = raw;
  const rewardDecimals = rewardToken.decimals;

  const rewardRate = Number(emissionRate) / Math.pow(10, rewardDecimals);
  const rewardRateUsd = rewardRate * rewardTokenPriceUsd;

  const weeklyRewardRate = rewardRate * SECONDS_PER_WEEK;
  const weeklyRewardRateUsd = rewardRateUsd * SECONDS_PER_WEEK;

  const poolsDisplay = transformPools(pools, totalAllocPoint, rewardRate, rewardRateUsd);

  const totalTvlUsd = poolsDisplay.reduce((sum, p) => sum + p.tvlUsd, 0);
  const weightedAprSum = poolsDisplay.reduce((sum, p) => sum + p.averageApr * p.tvlUsd, 0);
  const averageApr = totalTvlUsd > 0 ? weightedAprSum / totalTvlUsd : 0;

  const userRelicsDisplay = transformUserRelics(userData, poolsDisplay, rewardDecimals, rewardTokenPriceUsd);
  const allRelicsDisplay = transformAllRelics(allRelicsRaw, poolsDisplay, rewardDecimals, rewardTokenPriceUsd);

  const totalUserDepositUsd = userRelicsDisplay.reduce((sum, r) => sum + r.amountUsd, 0);

  const totalUserPendingRewardsRaw = userRelicsDisplay.reduce((sum, r) => sum + r.pendingReward.raw, BigInt(0));
  const totalUserPendingRewards = TokenAmount.fromRaw(totalUserPendingRewardsRaw, rewardDecimals);
  const totalUserPendingRewardsUsd = totalUserPendingRewards.toUSD(rewardTokenPriceUsd);

  const userTokenBalances = transformTokenBalances(userData, pools);
  const userTokenAllowances = transformTokenAllowances(userData, pools);

  return {
    address,
    rewardTokenSymbol: rewardToken.symbol,
    rewardTokenDecimals: rewardDecimals,
    oppPriceUsd,
    tvlUsd: totalTvlUsd,
    averageApr,
    weeklyRewardRate,
    weeklyRewardRateUsd,
    pools: poolsDisplay,
    userRelics: userRelicsDisplay,
    totalUserDepositUsd,
    totalUserPendingRewards,
    totalUserPendingRewardsUsd,
    userTokenBalances,
    userTokenAllowances,
    allRelics: allRelicsDisplay,
    allRelicsLoading,
    allRelicsLoaded,
  };
}

function transformPools(
  pools: RawPoolData[],
  totalAllocPoint: number,
  rewardRate: number,
  rewardRateUsd: number
): PoolDisplayData[] {
  return pools.map((pool) => {
    const poolAllocShare = totalAllocPoint > 0 ? pool.allocPoint / totalAllocPoint : 0;
    const tokenPriceUsd = pool.tokenPriceUsd;

    const levelsTvlUsd = pool.levels.map((lvl) => {
      const balance = Number(lvl.balance) / Math.pow(10, pool.tokenDecimals);
      return balance * tokenPriceUsd;
    });

    const poolTvlUsd = levelsTvlUsd.reduce((sum, tvl) => sum + tvl, 0);

    let totalMultiplier = 0;
    pool.levels.forEach((lvl, idx) => {
      const multiplier = lvl.multiplier;
      totalMultiplier += levelsTvlUsd[idx] * multiplier;
    });

    let poolWeightedApr = 0;

    const levelsDisplay: LevelDisplayData[] = pool.levels.map((lvl, idx) => {
      const tvlUsd = levelsTvlUsd[idx];
      const multiplier = lvl.multiplier;

      const levelAllocShare =
        totalMultiplier > 0 ? ((tvlUsd * multiplier) / totalMultiplier) * poolAllocShare : 0;

      const levelRewardRate = levelAllocShare * rewardRate;
      const levelRewardRateUsd = levelAllocShare * rewardRateUsd;

      const weeklyRewardRate = levelRewardRate * SECONDS_PER_WEEK;
      const weeklyRewardRateUsd = levelRewardRateUsd * SECONDS_PER_WEEK;

      const apr = tvlUsd > 0 ? (100 * levelRewardRateUsd * SECONDS_PER_YEAR) / tvlUsd : 0;
      poolWeightedApr += apr * tvlUsd;

      return {
        level: idx + 1,
        requiredMaturity: lvl.requiredMaturity,
        multiplier: multiplier / 10,
        tvlUsd,
        apr,
        allocShare: levelAllocShare,
        rewardRate: levelRewardRate,
        rewardRateUsd: levelRewardRateUsd,
        weeklyRewardRate,
        weeklyRewardRateUsd,
      };
    });

    const poolAverageApr = poolTvlUsd > 0 ? poolWeightedApr / poolTvlUsd : 0;

    return {
      index: pool.index,
      displayName: pool.displayName,
      shortName: pool.shortName,
      url: pool.url,
      tokenAddress: pool.token,
      tokenSymbol: pool.tokenSymbol,
      tokenDecimals: pool.tokenDecimals,
      allocPoint: pool.allocPoint,
      allocShare: poolAllocShare,
      tvlUsd: poolTvlUsd,
      averageApr: poolAverageApr,
      levels: levelsDisplay,
      isActive: pool.allocPoint > 0,
    };
  });
}

function transformUserRelics(
  userData: RawUserData | null,
  pools: PoolDisplayData[],
  rewardDecimals: number,
  rewardTokenPriceUsd: number
): RelicDisplayData[] {
  if (!userData) return [];
  return userData.relics.map((relic) => transformSingleRelic(relic, pools, rewardDecimals, rewardTokenPriceUsd));
}

function transformAllRelics(
  relics: RawRelicData[],
  pools: PoolDisplayData[],
  rewardDecimals: number,
  rewardTokenPriceUsd: number
): RelicDisplayData[] {
  return relics
    .map((relic) => {
      try {
        return transformSingleRelic(relic, pools, rewardDecimals, rewardTokenPriceUsd);
      } catch {
        return null;
      }
    })
    .filter((r): r is RelicDisplayData => r !== null);
}

function transformSingleRelic(
  relic: RawRelicData,
  pools: PoolDisplayData[],
  rewardDecimals: number,
  rewardTokenPriceUsd: number
): RelicDisplayData {
  const pool = pools.find((p) => p.index === relic.poolId);
  const poolName = pool?.shortName ?? `Pool #${relic.poolId}`;
  const poolUrl = pool?.url ?? "#";
  const tokenDecimals = pool?.tokenDecimals ?? 18;

  const amount = TokenAmount.fromRaw(relic.amount, tokenDecimals);

  const amountUsd = pool ? amount.toNumber() * (pool.tvlUsd / getTotalPoolBalance(pool)) : 0;

  const pendingReward = TokenAmount.fromRaw(relic.pendingReward, rewardDecimals);
  const pendingRewardUsd = pendingReward.toUSD(rewardTokenPriceUsd);

  const maxLevel = pool?.levels.length ?? 0;
  const currentLevel = Math.min(Math.max(relic.level + 1, 1), Math.max(maxLevel, 1));
  const levelData = pool?.levels[currentLevel - 1];

  const multiplier = levelData?.multiplier ?? 1;
  const apr = levelData?.apr ?? 0;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const maturitySeconds = nowSeconds - relic.entry;

  let secondsToNextLevel = 0;
  if (pool && currentLevel < maxLevel) {
    const nextLevelData = pool.levels[currentLevel];
    if (nextLevelData) {
      secondsToNextLevel = Math.max(0, nextLevelData.requiredMaturity - maturitySeconds);
    }
  }

  return {
    id: relic.id,
    poolId: relic.poolId,
    poolName,
    poolUrl,
    amount,
    amountUsd,
    pendingReward,
    pendingRewardUsd,
    level: currentLevel,
    maxLevel,
    multiplier,
    maturitySeconds,
    secondsToNextLevel,
    apr,
    canClaim: !pendingReward.isZero(),
    canLevelUp: relic.levelOnUpdate > relic.level,
  };
}

function getTotalPoolBalance(pool: PoolDisplayData): number {
  return pool.levels.reduce((sum, l) => sum + l.tvlUsd, 0) || 1;
}

function transformTokenBalances(userData: RawUserData | null, pools: RawPoolData[]): Record<string, TokenAmount> {
  if (!userData) return {};

  const decimalsByToken: Record<string, number> = {};
  for (const p of pools) {
    decimalsByToken[p.token.toLowerCase()] = p.tokenDecimals;
  }

  const out: Record<string, TokenAmount> = {};
  for (const [token, bal] of Object.entries(userData.tokenBalances)) {
    const decimals = decimalsByToken[token.toLowerCase()] ?? 18;
    out[token] = TokenAmount.fromRaw(bal, decimals);
  }
  return out;
}

function transformTokenAllowances(userData: RawUserData | null, pools: RawPoolData[]): Record<string, TokenAmount> {
  if (!userData) return {};

  const decimalsByToken: Record<string, number> = {};
  for (const p of pools) {
    decimalsByToken[p.token.toLowerCase()] = p.tokenDecimals;
  }

  const out: Record<string, TokenAmount> = {};
  for (const [token, allowance] of Object.entries(userData.tokenAllowances)) {
    const decimals = decimalsByToken[token.toLowerCase()] ?? 18;
    out[token] = TokenAmount.fromRaw(allowance, decimals);
  }
  return out;
}