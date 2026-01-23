import { TokenAmount } from "../value-objects/TokenAmount";

export interface RelicPosition {
  amount: TokenAmount;
  entry: number;
  poolId: number;
  level: number;
}

export class Relic {
  private constructor(
    private readonly relicId: number,
    private readonly ownerAddress: string,
    private readonly position: RelicPosition,
    private readonly pendingRewardAmount: TokenAmount,
    private readonly levelAfterUpdate: number
  ) {}

  static create(
    id: number,
    owner: string,
    position: RelicPosition,
    pendingReward: TokenAmount,
    levelOnUpdate: number
  ): Relic {
    return new Relic(id, owner, position, pendingReward, levelOnUpdate);
  }

  get id(): number {
    return this.relicId;
  }

  get owner(): string {
    return this.ownerAddress;
  }

  get poolId(): number {
    return this.position.poolId;
  }

  get amount(): TokenAmount {
    return this.position.amount;
  }

  get currentLevel(): number {
    return this.position.level;
  }

  get displayLevel(): number {
    return this.position.level + 1;
  }

  get entryTime(): number {
    return this.position.entry;
  }

  get pendingReward(): TokenAmount {
    return this.pendingRewardAmount;
  }

  get levelOnUpdate(): number {
    return this.levelAfterUpdate;
  }

  calculateMaturityInSeconds(): number {
    const nowInSeconds = Date.now() / 1000;
    return nowInSeconds - this.position.entry;
  }

  calculateTvlUsd(tokenPriceUsd: number): number {
    return this.position.amount.toUSD(tokenPriceUsd);
  }

  calculatePendingRewardUsd(rewardTokenPriceUsd: number): number {
    return this.pendingRewardAmount.toUSD(rewardTokenPriceUsd);
  }

  canLevelUp(): boolean {
    return this.levelAfterUpdate > this.position.level;
  }

  canClaim(): boolean {
    return !this.pendingRewardAmount.isZero();
  }

  hasBalance(): boolean {
    return !this.position.amount.isZero();
  }
}
