export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatUsdc(value: number): string {
  return `${roundMoney(value).toFixed(2)} USDC`;
}
