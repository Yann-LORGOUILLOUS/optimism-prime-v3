export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatUSD(value: number): string {
  return `$${formatNumber(value)}`;
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
