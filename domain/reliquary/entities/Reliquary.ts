import { TokenAmount } from "../value-objects/TokenAmount";
import { APR } from "../value-objects/APR";
import { Relic } from "./Relic";
import { Pool } from "./Pool";

export interface RewardToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  priceUsd: number;
}

export class Reliquary {
  private constructor(
    private readonly contractAddress: string,
    private readonly rewardTokenInfo: RewardToken,
    private readonly rewardBalance: TokenAmount,
    private readonly emissionRate: number,
    private readonly emissionRateUsd: number,
    private readonly totalValueLockedUsd: number,
    private readonly averageAPR: APR,
    private readonly totalAllocationPoints: number,
    private readonly stakingPools: Pool[],
    private readonly userRelics: Relic[]
  ) {}

  static create(
    address: string,
    rewardToken: RewardToken,
    rewardBalance: TokenAmount,
    rewardRate: number,
    rewardRateUsd: number,
    tvlUsd: number,
    averageApr: APR,
    totalAllocPoint: number,
    pools: Pool[],
    relics: Relic[]
  ): Reliquary {
    return new Reliquary(
      address,
      rewardToken,
      rewardBalance,
      rewardRate,
      rewardRateUsd,
      tvlUsd,
      averageApr,
      totalAllocPoint,
      pools,
      relics
    );
  }

  get address(): string {
    return this.contractAddress;
  }

  get rewardToken(): RewardToken {
    return this.rewardTokenInfo;
  }

  get tvlUsd(): number {
    return this.totalValueLockedUsd;
  }

  get averageApr(): APR {
    return this.averageAPR;
  }

  get rewardRate(): number {
    return this.emissionRate;
  }

  get rewardRateUsd(): number {
    return this.emissionRateUsd;
  }

  get totalAllocPoint(): number {
    return this.totalAllocationPoints;
  }

  get pools(): Pool[] {
    return [...this.stakingPools];
  }

  get relics(): Relic[] {
    return [...this.userRelics];
  }

  getActivePools(): Pool[] {
    return this.stakingPools.filter(pool => pool.isActive());
  }

  getPoolByIndex(index: number): Pool | undefined {
    return this.stakingPools.find(pool => pool.index === index);
  }

  getPoolByTokenAddress(tokenAddress: string): Pool | undefined {
    return this.stakingPools.find(pool => pool.tokenAddress === tokenAddress);
  }

  getRelicById(id: number): Relic | undefined {
    return this.userRelics.find(relic => relic.id === id);
  }

  getRelicsForPool(poolIndex: number): Relic[] {
    return this.userRelics.filter(relic => relic.poolId === poolIndex);
  }

  calculateTotalUserDepositsUsd(): number {
    return this.userRelics.reduce((total, relic) => {
      const pool = this.getPoolByIndex(relic.poolId);
      if (!pool) return total;
      return total + relic.calculateTvlUsd(pool.token.priceUsd);
    }, 0);
  }

  calculateTotalPendingRewardsUsd(): number {
    return this.userRelics.reduce((total, relic) => {
      return total + relic.calculatePendingRewardUsd(this.rewardTokenInfo.priceUsd);
    }, 0);
  }

  calculateTotalPendingRewards(): TokenAmount {
    const decimals = this.rewardTokenInfo.decimals;
    return this.userRelics.reduce(
      (total, relic) => total.add(relic.pendingReward),
      TokenAmount.zero(decimals)
    );
  }

  calculateUserDepositsUsdByPool(): Map<number, number> {
    const depositsByPool = new Map<number, number>();
    
    for (const relic of this.userRelics) {
      const pool = this.getPoolByIndex(relic.poolId);
      if (!pool) continue;
      
      const currentDeposit = depositsByPool.get(relic.poolId) || 0;
      const relicTvl = relic.calculateTvlUsd(pool.token.priceUsd);
      depositsByPool.set(relic.poolId, currentDeposit + relicTvl);
    }
    
    return depositsByPool;
  }

  calculateWeeklyRewardRate(): number {
    const secondsPerWeek = 3600 * 24 * 7;
    return this.emissionRate * secondsPerWeek;
  }

  calculateWeeklyRewardRateUsd(): number {
    const secondsPerWeek = 3600 * 24 * 7;
    return this.emissionRateUsd * secondsPerWeek;
  }

  hasUserRelics(): boolean {
    return this.userRelics.length > 0;
  }
}