import type { AppConfig } from '../app/config.js';
import type { PendingTradeSession } from '../types/session.js';
import type { MarketCandidate } from '../types/market.js';
import type { ParsedTradeIntent, TradePreview } from '../types/trade.js';
import type { PendingTradeStore } from '../session/pendingTradeStore.js';
import { createPendingTradeId } from '../utils/ids.js';
import { addSeconds, nowIso } from '../utils/time.js';
import { AuditLogger } from '../logger/auditLogger.js';

export class ConfirmationService {
  constructor(private readonly config: AppConfig, private readonly store: PendingTradeStore, private readonly auditLogger: AuditLogger) {}

  async createPendingTrade(userId: string, chatId: string, parsedIntent: ParsedTradeIntent, market: MarketCandidate, preview: TradePreview, sourceMessageId?: number): Promise<PendingTradeSession> {
    const createdAt = nowIso();
    const session: PendingTradeSession = {
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

  async confirm(pendingTradeId: string): Promise<PendingTradeSession | undefined> {
    const updated = await this.store.updateState(pendingTradeId, 'awaiting_confirmation', 'confirmed');
    if (updated) this.auditLogger.event('pending_trade_confirmed', { pendingTradeId });
    return updated;
  }

  async cancel(pendingTradeId: string): Promise<PendingTradeSession | undefined> {
    const existing = await this.store.get(pendingTradeId);
    if (!existing) return undefined;
    existing.state = 'cancelled';
    await this.store.update(existing);
    this.auditLogger.event('pending_trade_cancelled', { pendingTradeId });
    return existing;
  }
}
