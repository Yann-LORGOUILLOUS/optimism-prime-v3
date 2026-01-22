export class MaturityLevel {
  private constructor(
    private readonly levelValue: number,
    private readonly multiplierValue: number,
    private readonly requiredMaturityInSeconds: number
  ) {}

  static create(level: number, multiplier: number, requiredMaturity: number): MaturityLevel {
    return new MaturityLevel(level, multiplier, requiredMaturity);
  }

  get level(): number {
    return this.levelValue;
  }

  get displayLevel(): number {
    return this.levelValue + 1;
  }

  get multiplier(): number {
    return this.multiplierValue;
  }

  get requiredMaturity(): number {
    return this.requiredMaturityInSeconds;
  }

  isMaxLevel(totalLevels: number): boolean {
    return this.levelValue >= totalLevels - 1;
  }

  canLevelUp(currentMaturityInSeconds: number, totalLevels: number): boolean {
    if (this.isMaxLevel(totalLevels)) {
      return false;
    }
    return currentMaturityInSeconds >= this.requiredMaturityInSeconds;
  }

  secondsUntilNextLevel(currentMaturityInSeconds: number): number {
    const remaining = this.requiredMaturityInSeconds - currentMaturityInSeconds;
    return Math.max(0, remaining);
  }
}