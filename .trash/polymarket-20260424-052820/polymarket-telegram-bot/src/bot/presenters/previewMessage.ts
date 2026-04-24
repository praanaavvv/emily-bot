import type { PendingTradeSession } from '../../types/session.js';
import { formatUsdc } from '../../utils/money.js';
import { secondsUntil } from '../../utils/time.js';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatNumber(value: number | undefined, digits = 4, fallback = 'N/A'): string {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }
  return value.toFixed(digits);
}

function clampText(value: string, max = 220): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

export function canConfirmTrade(session: PendingTradeSession): boolean {
  const preview = session.preview;
  if (!preview) return false;
  return typeof preview.impliedPrice === 'number' && Number.isFinite(preview.impliedPrice);
}

export function buildPreviewMessage(session: PendingTradeSession): string {
  const preview = session.preview!;
  const ttl = secondsUntil(session.expiresAt);

  const lines: string[] = [
    '<b>🧾 Review trade</b>',
    '',
    '<b>Title</b>',
    escapeHtml(clampText(preview.marketTitle)),
    '',
    '<b>Key details</b>',
    `• Side: <b>${escapeHtml(preview.side.toUpperCase())}</b>`,
    `• Action: <b>${escapeHtml(preview.action.toUpperCase())}</b>`,
    `• Amount: <b>${escapeHtml(formatUsdc(preview.amount.value))}</b>`,
    `• Price: <b>${formatNumber(preview.impliedPrice)}</b> implied`,
    `• Est. Shares: <b>${formatNumber(preview.estimatedShares)}</b>`,
    `• Worst Slippage: <b>${typeof preview.worstCaseSlippagePct === 'number' ? `${formatNumber(preview.worstCaseSlippagePct, 2)}%` : 'N/A'}</b>`,
    `• Max Spend: <b>${typeof preview.maxSpend === 'number' ? escapeHtml(formatUsdc(preview.maxSpend)) : 'N/A'}</b>`,
  ];

  if (preview.warningText) {
    lines.push('', '<b>Warning</b>', `⚠️ ${escapeHtml(clampText(preview.warningText, 180))}`);
  }

  lines.push('', '<b>Next action</b>');
  if (canConfirmTrade(session)) {
    lines.push(`Confirm or cancel below. This preview expires in <b>${ttl}s</b>.`);
  } else {
    lines.push('Live pricing is unavailable, so confirmation is disabled. Try again in a moment.');
  }

  return lines.join('\n');
}
