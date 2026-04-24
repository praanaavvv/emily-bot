import type { PendingTradeSession } from '../../types/session.js';
import { formatUsdc } from '../../utils/money.js';
import { secondsUntil } from '../../utils/time.js';

export function buildPreviewMessage(session: PendingTradeSession): string {
  const preview = session.preview!;
  const ttl = secondsUntil(session.expiresAt);

  return [
    '🟦 Confirm Trade',
    '',
    `Market: ${preview.marketTitle}`,
    `Side: ${preview.side.toUpperCase()}`,
    `Action: ${preview.action.toUpperCase()}`,
    `Amount: ${formatUsdc(preview.amount.value)}`,
    `Implied Price: ${preview.impliedPrice?.toFixed(4) ?? 'Unavailable'}`,
    `Est. Shares: ${preview.estimatedShares?.toFixed(4) ?? 'Unavailable'}`,
    `Worst Slippage: ${preview.worstCaseSlippagePct?.toFixed(2) ?? 'Unavailable'}%`,
    `Max Spend: ${preview.maxSpend ? formatUsdc(preview.maxSpend) : 'Unavailable'}`,
    '',
    `⚠️ ${preview.warningText}`,
    `Expires In: ${ttl}s`,
    `Pending ID: ${session.pendingTradeId}`,
  ].join('\n');
}
