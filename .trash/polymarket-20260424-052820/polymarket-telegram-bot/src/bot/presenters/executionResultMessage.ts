import type { ExecutionResult } from '../../types/trade.js';
import { formatUsdc } from '../../utils/money.js';

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

function limitWarnings(warnings: string[]): string[] {
  return warnings.slice(0, 2);
}

export function buildExecutionResultMessage(result: ExecutionResult): string {
  if (result.kind === 'execution_success') {
    const warnings = limitWarnings(result.warnings);
    const title = warnings.some((warning) => warning.toLowerCase().includes('dry-run'))
      ? '✅ Dry Run Complete'
      : warnings.some((warning) => warning.toLowerCase().includes('paper'))
        ? '✅ Paper Trade Recorded'
        : '✅ Trade placed';

    const lines: string[] = [
      `<b>${title}</b>`,
      '',
      '<b>Key details</b>',
      `• Order ID: <b>${escapeHtml(result.orderId)}</b>`,
      `• Status: <b>${escapeHtml(result.status)}</b>`,
      `• Amount: <b>${escapeHtml(formatUsdc(result.requestedAmount.value))}</b>`,
      `• Avg Price: <b>${formatNumber(result.execution.avgPrice)}</b>`,
      `• Shares: <b>${formatNumber(result.execution.filledShares)}</b>`,
    ];

    if (warnings.length > 0) {
      lines.push('', '<b>Warning</b>');
      for (const warning of warnings) {
        lines.push(`⚠️ ${escapeHtml(warning)}`);
      }
    }

    lines.push('', '<b>Next action</b>', 'You can send another trade request whenever you’re ready.');
    return lines.join('\n');
  }

  return [
    '<b>❌ Trade failed</b>',
    '',
    '<b>Key details</b>',
    escapeHtml(mapFailureMessage(result)),
    '',
    '<b>Next action</b>',
    escapeHtml(nextActionForFailure(result)),
  ].join('\n');
}

function mapFailureMessage(result: Extract<ExecutionResult, { kind: 'execution_failure' }>): string {
  switch (result.category) {
    case 'expired_session':
      return 'This confirmation expired.';
    case 'duplicate_execution':
      return 'That confirmation was already used.';
    case 'slippage_exceeded':
      return 'I am not placing this trade because estimated slippage is too high.';
    case 'market_unavailable':
      return 'The matched market is not tradable right now.';
    case 'validation_error':
      return result.message || 'The trade request is no longer valid.';
    case 'unknown_execution_state':
      return 'The order result is unclear right now. It may have been submitted, so I am not retrying automatically.';
    case 'network_error':
      return 'I could not place that trade because of a network or upstream error.';
    case 'exchange_rejection':
      return 'The exchange rejected the order.';
    case 'insufficient_balance':
      return 'There is not enough balance to place that order.';
    case 'position_unavailable':
      return 'There is not enough position available to sell.';
    case 'auth_error':
      return 'Trading credentials are not configured correctly.';
    default:
      return result.message || 'I could not place that trade.';
  }
}

function nextActionForFailure(result: Extract<ExecutionResult, { kind: 'execution_failure' }>): string {
  switch (result.category) {
    case 'expired_session':
      return 'Request a fresh preview and confirm again.';
    case 'duplicate_execution':
      return 'No second order was placed.';
    case 'slippage_exceeded':
      return 'Try a smaller amount or wait for better liquidity.';
    case 'unknown_execution_state':
      return 'Check order status before trying again.';
    default:
      return 'Review the details and try again.';
  }
}
