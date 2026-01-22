export class TokenAmount {
  private constructor(
    private readonly rawValue: bigint,
    private readonly tokenDecimals: number
  ) {}

  static fromRaw(value: bigint, decimals: number): TokenAmount {
    return new TokenAmount(value, decimals);
  }

  static fromFormatted(value: string, decimals: number): TokenAmount {
    const [wholePart, fractionPart = ""] = value.split(".");
    const normalizedFraction = fractionPart.padEnd(decimals, "0").slice(0, decimals);
    const rawString = wholePart + normalizedFraction;
    return new TokenAmount(BigInt(rawString), decimals);
  }

  static zero(decimals: number): TokenAmount {
    return new TokenAmount(BigInt(0), decimals);
  }

  get raw(): bigint {
    return this.rawValue;
  }

  get decimals(): number {
    return this.tokenDecimals;
  }

  formatted(displayPrecision: number = 4): string {
    const divisor = BigInt(10) ** BigInt(this.tokenDecimals);
    const wholePart = this.rawValue / divisor;
    const remainder = this.rawValue % divisor;

    if (this.hasNoFractionalPart(remainder)) {
      return wholePart.toString();
    }

    return this.formatWithFraction(wholePart, remainder, displayPrecision);
  }

  private hasNoFractionalPart(remainder: bigint): boolean {
    return remainder === BigInt(0);
  }

  private formatWithFraction(wholePart: bigint, remainder: bigint, precision: number): string {
    const fractionString = remainder.toString().padStart(this.tokenDecimals, "0");
    const trimmedFraction = fractionString.slice(0, precision).replace(/0+$/, "");
    
    return trimmedFraction 
      ? `${wholePart}.${trimmedFraction}` 
      : wholePart.toString();
  }

  toNumber(): number {
    return Number(this.rawValue) / 10 ** this.tokenDecimals;
  }

  toUSD(pricePerToken: number): number {
    return this.toNumber() * pricePerToken;
  }

  isZero(): boolean {
    return this.rawValue === BigInt(0);
  }

  isGreaterThan(other: TokenAmount): boolean {
    return this.rawValue > other.rawValue;
  }

  add(other: TokenAmount): TokenAmount {
    this.ensureSameDecimals(other);
    return new TokenAmount(this.rawValue + other.rawValue, this.tokenDecimals);
  }

  subtract(other: TokenAmount): TokenAmount {
    this.ensureSameDecimals(other);
    return new TokenAmount(this.rawValue - other.rawValue, this.tokenDecimals);
  }

  private ensureSameDecimals(other: TokenAmount): void {
    if (this.tokenDecimals !== other.tokenDecimals) {
      throw new Error("Cannot operate on TokenAmounts with different decimals");
    }
  }
}