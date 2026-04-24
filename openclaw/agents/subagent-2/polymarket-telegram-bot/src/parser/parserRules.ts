export const amountPatterns = [
  /\$(\d+(?:\.\d+)?)/i,
  /\b(\d+(?:\.\d+)?)\s*usdc\b/i,
  /\b(\d+(?:\.\d+)?)\s*usd\b/i,
  /\b(\d+(?:\.\d+)?)\s*dollars?\b/i,
  /\bfor\s+\$?(\d+(?:\.\d+)?)\b/i,
  /\bwith\s+\$?(\d+(?:\.\d+)?)\b/i,
  /\bape\s+\$?(\d+(?:\.\d+)?)\b/i,
  /\bbuy\s+\$?(\d+(?:\.\d+)?)\b/i,
  /\b(?:yes|no)\s+\$?(\d+(?:\.\d+)?)\s*(?:usdc|usd|dollars?)?\b/i,
];

export const slippagePattern = /(?:max\s+slippage|slippage|slippage\s+cap)\s*(?:of\s*)?(\d+(?:\.\d+)?)%/i;
export const marketOrderPattern = /\bmarket\s+order\b|\bat\s+market\b/i;
export const limitOrderPattern = /\blimit\s+order\b|\baggressive\s+limit\b/i;

export const marketNoisePatterns: RegExp[] = [
  /\bbuy\b|\blong\b|\bget\b|\bopen\b|\benter\b|\bape\b/gi,
  /\bsell\b|\bclose\b|\bexit\b|\breduce\b|\boffload\b/gi,
  /\byes\b|\bno\b/gi,
  /\$(\d+(?:\.\d+)?)/gi,
  /\b(\d+(?:\.\d+)?)\s*(?:usdc|usd|dollars?)\b/gi,
  /(?:max\s+slippage|slippage|slippage\s+cap)\s*(?:of\s*)?(\d+(?:\.\d+)?)%/gi,
  /\bmarket\s+order\b|\bat\s+market\b/gi,
  /\blimit\s+order\b|\baggressive\s+limit\b/gi,
  /\bposition\b|\bmarket\b/gi,
];
