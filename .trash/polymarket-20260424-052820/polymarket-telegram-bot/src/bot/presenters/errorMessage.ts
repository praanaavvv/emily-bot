function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function clampText(value: string, max = 180): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

export function buildErrorMessage(message: string): string {
  return [
    '<b>⚠️ Request needs attention</b>',
    '',
    '<b>Key details</b>',
    escapeHtml(clampText(message)),
    '',
    '<b>Next action</b>',
    'Fix the missing detail and try again.',
  ].join('\n');
}

export function buildSearchingMessage(): string {
  return [
    '<b>🔍 Searching market...</b>',
    '',
    '<b>Key details</b>',
    'Looking for the best matching Polymarket market.',
    '',
    '<b>Next action</b>',
    'Please wait a moment.',
  ].join('\n');
}

export function buildAwaitingConfirmationMessage(): string {
  return [
    '<b>🧾 Review trade...</b>',
    '',
    '<b>Key details</b>',
    'Here is the trade preview.',
    '',
    '<b>Next action</b>',
    'Confirm if it looks right, or cancel.',
  ].join('\n');
}

export function buildPlacingOrderMessage(): string {
  return [
    '<b>⏳ Placing order...</b>',
    '',
    '<b>Key details</b>',
    'Sending your order now.',
    '',
    '<b>Next action</b>',
    'Please wait.',
  ].join('\n');
}

export function invalidCallbackMessage(): string {
  return [
    '<b>⚠️ Action no longer valid</b>',
    '',
    '<b>Key details</b>',
    'That button payload was invalid.',
    '',
    '<b>Next action</b>',
    'Send the trade command again.',
  ].join('\n');
}

export function staleConfirmationMessage(): string {
  return [
    '<b>⚠️ Confirmation expired</b>',
    '',
    '<b>Key details</b>',
    'This confirmation expired.',
    '',
    '<b>Next action</b>',
    'Request a fresh preview and confirm again.',
  ].join('\n');
}

export function duplicateConfirmationMessage(): string {
  return [
    '<b>⚠️ Confirmation already used</b>',
    '',
    '<b>Key details</b>',
    'That confirmation was already used or is currently executing.',
    '',
    '<b>Next action</b>',
    'No second order was placed.',
  ].join('\n');
}

export function ownershipMismatchMessage(): string {
  return [
    '<b>⚠️ Session mismatch</b>',
    '',
    '<b>Key details</b>',
    'That confirmation belongs to a different session.',
    '',
    '<b>Next action</b>',
    'Send your own trade request.',
  ].join('\n');
}

export function unknownSessionMessage(): string {
  return [
    '<b>⚠️ Session missing</b>',
    '',
    '<b>Key details</b>',
    'That session no longer exists.',
    '',
    '<b>Next action</b>',
    'Send the trade request again.',
  ].join('\n');
}

export function invalidMarketSelectionMessage(): string {
  return [
    '<b>⚠️ Market selection invalid</b>',
    '',
    '<b>Key details</b>',
    'That market option is no longer valid.',
    '',
    '<b>Next action</b>',
    'Request the trade again and choose from the new options.',
  ].join('\n');
}

export function marketNotFoundMessage(): string {
  return [
    '<b>⚠️ No safe match found</b>',
    '',
    '<b>Key details</b>',
    'I could not find a safe live market match for that.',
    '',
    '<b>Next action</b>',
    'Add more detail like the asset, date, or target.',
  ].join('\n');
}

export function nonTradableMarketMessage(title: string): string {
  return [
    '<b>⚠️ Market not tradable</b>',
    '',
    '<b>Key details</b>',
    escapeHtml(`I found a likely market, but it is not tradable right now: ${clampText(title, 120)}`),
    '',
    '<b>Next action</b>',
    'Try a different market or try again later.',
  ].join('\n');
}
