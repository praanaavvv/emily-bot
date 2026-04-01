export function roundMoney(value) {
    return Math.round(value * 100) / 100;
}
export function formatUsdc(value) {
    return `${roundMoney(value).toFixed(2)} USDC`;
}
