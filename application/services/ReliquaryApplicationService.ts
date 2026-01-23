import {
  IReliquaryRepository,
  ReliquaryConfig,
  ReliquaryRawData,
  UserReliquaryRawData,
  PoolRawData,
  RelicRawData,
} from "@/domain/reliquary/repositories";
import { TokenAmount } from "@/domain/reliquary/value-objects/TokenAmount";
import { SECONDS_PER_WEEK, SECONDS_PER_YEAR } from "@/shared/constants/time";
import {
  ReliquaryDisplayData,
  PoolDisplayData,
  RelicDisplayData,
  LevelDisplayData,
} from "./types";

export class ReliquaryApplicationService {
  constructor(private readonly repository: IReliquaryRepository) {}

  async getReliquaryDisplayData(
    config: ReliquaryConfig,
    userAddress?: `0x${string}`
  ): Promise<ReliquaryDisplayData> {
    const rawData = await this.repository.getReliquaryData(config);

    const userData = userAddress
      ? await this.repository.getUserData(rawData.address, userAddress, rawData.pools)
      : null;

    return this.transformToDisplayData(rawData, userData, [], false, false);
  }

  async loadAllRelics(
    reliquaryAddress: `0x${string}`,
    maxCount: number
  ): Promise<RelicRawData[]> {
    return this.repository.getAllRelics(reliquaryAddress, maxCount);
  }

  transformToDisplayData(
    raw: ReliquaryRawData,
    userData: UserReliquaryRawData | null,
    allRelicsRaw: RelicRawData[],
    allRelicsLoading: boolean,
    allRelicsLoaded: boolean
  ): ReliquaryDisplayData {
    const { rewardToken, emissionRate, totalAllocPoint, pools, oppPriceUsd, rewardTokenPriceUsd, address } = raw;
    const rewardDecimals = rewardToken.decimals;

    const rewardRate = Number(emissionRate) / Math.pow(10, rewardDecimals);
    const rewardRateUsd = rewardRate * rewardTokenPriceUsd;

    const weeklyRewardRate = rewardRate * SECONDS_PER_WEEK;
    const weeklyRewardRateUsd = rewardRateUsd * SECONDS_PER_WEEK;

    const poolsDisplay = this.transformPools(pools, totalAllocPoint, rewardRate, rewardRateUsd);

    const totalTvlUsd = poolsDisplay.reduce((sum, p) => sum + p.tvlUsd, 0);
    const weightedAprSum = poolsDisplay.reduce((sum, p) => sum + p.averageApr * p.tvlUsd, 0);
    const averageApr = totalTvlUsd > 0 ? weightedAprSum / totalTvlUsd : 0;

    const userRelicsDisplay = this.transformUserRelics(userData, poolsDisplay, rewardDecimals, rewardTokenPriceUsd);
    const allRelicsDisplay = this.transformAllRelics(allRelicsRaw, poolsDisplay, rewardDecimals, rewardTokenPriceUsd);

    const totalUserDepositUsd = userRelicsDisplay.reduce((sum, r) => sum + r.amountUsd, 0);

    const totalUserPendingRewardsRaw = userRelicsDisplay.reduce((sum, r) => sum + r.pendingReward.raw, BigInt(0));
    const totalUserPendingRewards = TokenAmount.fromRaw(totalUserPendingRewardsRaw, rewardDecimals);
    const totalUserPendingRewardsUsd = totalUserPendingRewards.toUSD(rewardTokenPriceUsd);

    const userTokenBalances = this.transformTokenBalances(userData, pools);
    const userTokenAllowances = this.transformTokenAllowances(userData, pools);

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

  private transformPools(
    pools: PoolRawData[],
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

        const levelWeeklyRewardRate = levelRewardRate * SECONDS_PER_WEEK;
        const levelWeeklyRewardRateUsd = levelRewardRateUsd * SECONDS_PER_WEEK;

        const apr = tvlUsd > 0 ? (100 * levelRewardRateUsd * SECONDS_PER_YEAR) / tvlUsd : 0;
        poolWeightedApr += apr * tvlUsd;

        return {
          level: idx + 1,
          requiredMaturity: lvl.requiredMaturity,
          multiplier: multiplier,
          tvlUsd,
          apr,
          allocShare: levelAllocShare,
          rewardRate: levelRewardRate,
          rewardRateUsd: levelRewardRateUsd,
          weeklyRewardRate: levelWeeklyRewardRate,
          weeklyRewardRateUsd: levelWeeklyRewardRateUsd,
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

  private transformUserRelics(
    userData: UserReliquaryRawData | null,
    pools: PoolDisplayData[],
    rewardDecimals: number,
    rewardTokenPriceUsd: number
  ): RelicDisplayData[] {
    if (!userData) return [];
    return userData.relics.map((relic) =>
      this.transformSingleRelic(relic, pools, rewardDecimals, rewardTokenPriceUsd)
    );
  }

  private transformAllRelics(
    relics: RelicRawData[],
    pools: PoolDisplayData[],
    rewardDecimals: number,
    rewardTokenPriceUsd: number
  ): RelicDisplayData[] {
    return relics
      .map((relic) => {
        try {
          return this.transformSingleRelic(relic, pools, rewardDecimals, rewardTokenPriceUsd);
        } catch {
          return null;
        }
      })
      .filter((r): r is RelicDisplayData => r !== null);
  }

  private transformSingleRelic(
    relic: RelicRawData,
    pools: PoolDisplayData[],
    rewardDecimals: number,
    rewardTokenPriceUsd: number
  ): RelicDisplayData {
    const pool = pools.find((p) => p.index === relic.poolId);
    const poolName = pool?.shortName ?? `Pool #${relic.poolId}`;
    const poolUrl = pool?.url ?? "#";
    const tokenDecimals = pool?.tokenDecimals ?? 18;

    const amount = TokenAmount.fromRaw(relic.amount, tokenDecimals);

    const amountUsd = pool ? amount.toNumber() * (pool.tvlUsd / this.getTotalPoolBalance(pool)) : 0;

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

  private getTotalPoolBalance(pool: PoolDisplayData): number {
    return pool.levels.reduce((sum, l) => sum + l.tvlUsd, 0) || 1;
  }

  private transformTokenBalances(
    userData: UserReliquaryRawData | null,
    pools: PoolRawData[]
  ): Record<string, TokenAmount> {
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

  private transformTokenAllowances(
    userData: UserReliquaryRawData | null,
    pools: PoolRawData[]
  ): Record<string, TokenAmount> {
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
}
