export function buildErrorMessage(message: string): string {
  return `⚠️ ${message}`;
}

export function invalidCallbackMessage(): string {
  return 'That button payload was invalid. Please send the trade command again.';
}

export function staleConfirmationMessage(): string {
  return 'That confirmation expired. Please request a fresh preview before trading.';
}

export function duplicateConfirmationMessage(): string {
  return 'That confirmation was already used or is currently executing.';
}

export function ownershipMismatchMessage(): string {
  return 'That confirmation does not belong to you.';
}

export function unknownSessionMessage(): string {
  return 'That session no longer exists. Please send the trade request again.';
}

export function invalidMarketSelectionMessage(): string {
  return 'That market option is no longer valid. Please request the trade again.';
}
