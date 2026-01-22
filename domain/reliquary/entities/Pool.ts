import { TokenAmount } from "../value-objects/TokenAmount";
import { APR } from "../value-objects/APR";

export interface LevelInfo {
  requiredMaturity: number;
  multiplier: number;
  balance: TokenAmount;
  tvlUsd: number;
  allocShare: number;
  rewardRate: number;
  rewardRateUsd: number;
  apr: APR;
}

export interface PoolToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  priceUsd: number;
  userBalance: TokenAmount;
  reliquaryAllowance: TokenAmount;
}

export class Pool {
  private constructor(
    private readonly poolIndex: number,
    private readonly poolName: string,
    private readonly poolToken: PoolToken,
    private readonly allocationPoints: number,
    private readonly allocationShare: number,
    private readonly totalValueLocked: TokenAmount,
    private readonly totalValueLockedUsd: number,
    private readonly averageAPR: APR,
    private readonly levels: LevelInfo[],
    private readonly partialWithdrawalsAllowed: boolean
  ) {}

  static create(
    index: number,
    name: string,
    token: PoolToken,
    allocPoint: number,
    allocShare: number,
    tvl: TokenAmount,
    tvlUsd: number,
    averageApr: APR,
    levels: LevelInfo[],
    allowPartialWithdrawals: boolean
  ): Pool {
    return new Pool(
      index,
      name,
      token,
      allocPoint,
      allocShare,
      tvl,
      tvlUsd,
      averageApr,
      levels,
      allowPartialWithdrawals
    );
  }

  get index(): number {
    return this.poolIndex;
  }

  get name(): string {
    return this.poolName;
  }

  get token(): PoolToken {
    return this.poolToken;
  }

  get tokenAddress(): string {
    return this.poolToken.address;
  }

  get allocPoint(): number {
    return this.allocationPoints;
  }

  get allocShare(): number {
    return this.allocationShare;
  }

  get tvl(): TokenAmount {
    return this.totalValueLocked;
  }

  get tvlUsd(): number {
    return this.totalValueLockedUsd;
  }

  get averageApr(): APR {
    return this.averageAPR;
  }

  get levelCount(): number {
    return this.levels.length;
  }

  get allowPartialWithdrawals(): boolean {
    return this.partialWithdrawalsAllowed;
  }

  isActive(): boolean {
    return this.allocationPoints > 0;
  }

  getLevelInfo(level: number): LevelInfo | undefined {
    return this.levels[level];
  }

  getAllLevels(): LevelInfo[] {
    return [...this.levels];
  }

  getAprForLevel(level: number): APR {
    const levelInfo = this.getLevelInfo(level);
    return levelInfo ? levelInfo.apr : APR.zero();
  }

  getMultiplierForLevel(level: number): number {
    const levelInfo = this.getLevelInfo(level);
    return levelInfo ? levelInfo.multiplier : 1;
  }

  getUserBalance(): TokenAmount {
    return this.poolToken.userBalance;
  }

  getUserAllowance(): TokenAmount {
    return this.poolToken.reliquaryAllowance;
  }

  needsApproval(amount: TokenAmount): boolean {
    return amount.isGreaterThan(this.poolToken.reliquaryAllowance);
  }
}