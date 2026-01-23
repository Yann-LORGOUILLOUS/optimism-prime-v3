export type ContractType = "reliquary" | "autobribes";

export interface ReliquaryConfig {
  version: 1 | 2;
  contractType: ContractType;
}

export interface RewardTokenRawData {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  balance: bigint;
}

export interface LevelRawData {
  requiredMaturity: number;
  multiplier: number;
  balance: bigint;
}

export interface PoolRawData {
  index: number;
  token: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenPriceUsd: number;
  allocPoint: number;
  totalBalance: bigint;
  levels: LevelRawData[];
  displayName: string;
  shortName: string;
  url: string;
  name: string;
}

export interface RelicRawData {
  id: number;
  poolId: number;
  amount: bigint;
  entry: number;
  level: number;
  pendingReward: bigint;
  levelOnUpdate: number;
}

export interface ReliquaryRawData {
  address: `0x${string}`;
  rewardToken: RewardTokenRawData;
  emissionRate: bigint;
  totalAllocPoint: number;
  pools: PoolRawData[];
  oppPriceUsd: number;
  rewardTokenPriceUsd: number;
}

export interface UserReliquaryRawData {
  relics: RelicRawData[];
  tokenBalances: Record<string, bigint>;
  tokenAllowances: Record<string, bigint>;
}

export interface IReliquaryRepository {
  getReliquaryData(config: ReliquaryConfig): Promise<ReliquaryRawData>;
  
  getUserData(
    reliquaryAddress: `0x${string}`,
    userAddress: `0x${string}`,
    pools: PoolRawData[]
  ): Promise<UserReliquaryRawData>;
  
  getAllRelics(
    reliquaryAddress: `0x${string}`,
    maxCount: number
  ): Promise<RelicRawData[]>;
}
