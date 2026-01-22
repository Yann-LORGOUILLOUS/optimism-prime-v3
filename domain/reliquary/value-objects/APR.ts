export class APR {
  private constructor(
    private readonly annualPercentageRate: number
  ) {}

  static fromDecimal(rate: number): APR {
    return new APR(rate);
  }

  static fromPercentage(percentage: number): APR {
    return new APR(percentage);
  }

  static zero(): APR {
    return new APR(0);
  }

  get value(): number {
    return this.annualPercentageRate;
  }

  formatted(decimalPlaces: number = 2): string {
    return this.annualPercentageRate.toFixed(decimalPlaces);
  }

  displayWithSymbol(decimalPlaces: number = 2): string {
    return `${this.formatted(decimalPlaces)}%`;
  }

  isHighYield(threshold: number = 100): boolean {
    return this.annualPercentageRate > threshold;
  }

  isZero(): boolean {
    return this.annualPercentageRate === 0;
  }
}