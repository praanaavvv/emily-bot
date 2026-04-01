import { randomUUID } from 'node:crypto';

export function createPendingTradeId(): string {
  return `pt_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

export function createClientOrderId(pendingTradeId: string): string {
  return `co_${pendingTradeId}`;
}

export function createQuoteVersion(): string {
  return randomUUID();
}
