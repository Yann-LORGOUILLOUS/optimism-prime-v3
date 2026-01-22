import { TokenAmount } from "@/domain/reliquary/value-objects/TokenAmount";

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
