export const amountPatterns = [
  /\$(\d+(?:\.\d+)?)/i,
  /\b(\d+(?:\.\d+)?)\s*usdc\b/i,
  /\bfor\s+(\d+(?:\.\d+)?)\b/i,
  /\bwith\s+\$(\d+(?:\.\d+)?)\b/i,
  /\bbuy\s+(\d+(?:\.\d+)?)\b/i,
];

export const slippagePattern = /(?:max\s+slippage|slippage|slippage\s+cap)\s*(?:of\s*)?(\d+(?:\.\d+)?)%/i;
export const marketOrderPattern = /\bmarket\s+order\b|\bat\s+market\b/i;
export const limitOrderPattern = /\blimit\s+order\b|\baggressive\s+limit\b/i;
