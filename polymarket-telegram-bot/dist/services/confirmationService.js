import { createPendingTradeId } from '../utils/ids.js';
import { addSeconds, nowIso } from '../utils/time.js';
export class ConfirmationService {
    config;
    store;
    auditLogger;
    constructor(config, store, auditLogger) {
        this.config = config;
        this.store = store;
        this.auditLogger = auditLogger;
    }
    async createPendingTrade(userId, chatId, parsedIntent, market, preview, sourceMessageId) {
        const createdAt = nowIso();
        const session = {
            pendingTradeId: createPendingTradeId(),
            userId,
            chatId,
            sourceMessageId,
            state: 'awaiting_confirmation',
            createdAt,
            expiresAt: addSeconds(createdAt, this.config.trading.confirmTtlSeconds),
            parsedIntent,
            matchedMarket: market,
            preview,
            execution: { attemptCount: 0 },
        };
        await this.store.save(session);
        this.auditLogger.event('pending_trade_created', { pendingTradeId: session.pendingTradeId, userId, marketId: market.marketId });
        return session;
    }
    async confirm(pendingTradeId) {
        const updated = await this.store.updateState(pendingTradeId, 'awaiting_confirmation', 'confirmed');
        if (updated)
            this.auditLogger.event('pending_trade_confirmed', { pendingTradeId });
        return updated;
    }
    async cancel(pendingTradeId) {
        const existing = await this.store.get(pendingTradeId);
        if (!existing)
            return undefined;
        existing.state = 'cancelled';
        await this.store.update(existing);
        this.auditLogger.event('pending_trade_cancelled', { pendingTradeId });
        return existing;
    }
}
