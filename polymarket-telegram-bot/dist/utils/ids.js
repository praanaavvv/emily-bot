import { randomUUID } from 'node:crypto';
export function createPendingTradeId() {
    return `pt_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
}
export function createClientOrderId(pendingTradeId) {
    return `co_${pendingTradeId}`;
}
export function createQuoteVersion() {
    return randomUUID();
}
