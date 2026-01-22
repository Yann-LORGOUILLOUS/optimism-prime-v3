import { PublicClient } from "viem";
import {
  IReliquaryRepository,
  ReliquaryConfig,
  ReliquaryRawData,
  UserReliquaryRawData,
  PoolRawData,
  RelicRawData,
} from "@/domain/reliquary/repositories";
import {
  readReliquaryData,
  readUserReliquaryData,
  readAllRelics,
  ReliquaryData,
  UserReliquaryData,
  PoolData,
  RelicData,
} from "../services/ReliquaryReader";

export class ReliquaryBlockchainRepository implements IReliquaryRepository {
  constructor(private readonly client: PublicClient) {}

  async getReliquaryData(config: ReliquaryConfig): Promise<ReliquaryRawData> {
    const data = await readReliquaryData(
      this.client,
      config.version,
      config.contractType
    );
    
    return this.mapReliquaryData(data);
  }

  async getUserData(
    reliquaryAddress: `0x${string}`,
    userAddress: `0x${string}`,
    pools: PoolRawData[]
  ): Promise<UserReliquaryRawData> {
    const readerPools = this.mapToReaderPools(pools);
    
    const data = await readUserReliquaryData(
      this.client,
      reliquaryAddress,
      userAddress,
      readerPools
    );
    
    return this.mapUserData(data);
  }

  async getAllRelics(
    reliquaryAddress: `0x${string}`,
    maxCount: number
  ): Promise<RelicRawData[]> {
    const relics = await readAllRelics(this.client, reliquaryAddress, maxCount);
    return relics.map(this.mapRelicData);
  }

  private mapReliquaryData(data: ReliquaryData): ReliquaryRawData {
    return {
      address: data.address,
      rewardToken: {
        address: data.rewardToken.address,
        name: data.rewardToken.name,
        symbol: data.rewardToken.symbol,
        decimals: data.rewardToken.decimals,
        balance: data.rewardToken.balance,
      },
      emissionRate: data.emissionRate,
      totalAllocPoint: data.totalAllocPoint,
      pools: data.pools.map(this.mapPoolData),
      oppPriceUsd: data.oppPriceUsd,
      rewardTokenPriceUsd: data.rewardTokenPriceUsd,
    };
  }

  private mapPoolData(pool: PoolData): PoolRawData {
    return {
      index: pool.index,
      token: pool.token,
      tokenSymbol: pool.tokenSymbol,
      tokenDecimals: pool.tokenDecimals,
      tokenPriceUsd: pool.tokenPriceUsd,
      allocPoint: pool.allocPoint,
      totalBalance: pool.totalBalance,
      levels: pool.levels.map((level) => ({
        requiredMaturity: level.requiredMaturity,
        multiplier: level.multiplier,
        balance: level.balance,
      })),
      displayName: pool.displayName,
      shortName: pool.shortName,
      url: pool.url,
      name: pool.name,
    };
  }

  private mapRelicData(relic: RelicData): RelicRawData {
    return {
      id: relic.id,
      poolId: relic.poolId,
      amount: relic.amount,
      entry: relic.entry,
      level: relic.level,
      pendingReward: relic.pendingReward,
      levelOnUpdate: relic.levelOnUpdate,
    };
  }

  private mapUserData(data: UserReliquaryData): UserReliquaryRawData {
    return {
      relics: data.relics.map(this.mapRelicData),
      tokenBalances: { ...data.tokenBalances },
      tokenAllowances: { ...data.tokenAllowances },
    };
  }

  private mapToReaderPools(pools: PoolRawData[]): PoolData[] {
    return pools.map((pool) => ({
      index: pool.index,
      token: pool.token,
      tokenSymbol: pool.tokenSymbol,
      tokenDecimals: pool.tokenDecimals,
      tokenPriceUsd: pool.tokenPriceUsd,
      allocPoint: pool.allocPoint,
      totalBalance: pool.totalBalance,
      levels: pool.levels.map((level) => ({
        requiredMaturity: level.requiredMaturity,
        multiplier: level.multiplier,
        balance: level.balance,
      })),
      displayName: pool.displayName,
      shortName: pool.shortName,
      url: pool.url,
      name: pool.name,
    }));
  }
}
