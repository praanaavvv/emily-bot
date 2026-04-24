import type { AppConfig } from '../app/config.js';
import type { PendingTradeSession } from '../types/session.js';
import type { MarketCandidate } from '../types/market.js';
import type { ParsedTradeIntent, TradePreview } from '../types/trade.js';
import type { PendingTradeStore } from '../session/pendingTradeStore.js';
import { createPendingTradeId } from '../utils/ids.js';
import { addSeconds, isExpired, nowIso } from '../utils/time.js';
import { AuditLogger } from '../logger/auditLogger.js';

export class ConfirmationService {
  constructor(
    private readonly config: AppConfig,
    private readonly store: PendingTradeStore,
    private readonly auditLogger: AuditLogger
  ) {}

  async createPendingTrade(
    userId: string,
    chatId: string,
    parsedIntent: ParsedTradeIntent,
    market: MarketCandidate,
    preview: TradePreview,
    sourceMessageId?: number
  ): Promise<PendingTradeSession> {
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
    this.auditLogger.event('pending_trade_created', {
      pendingTradeId: session.pendingTradeId,
      userId,
      marketId: market.marketId,
      expiresAt: session.expiresAt,
    });
    return session;
  }

  async createAmbiguousSelectionSession(
    userId: string,
    chatId: string,
    parsedIntent: ParsedTradeIntent,
    marketCandidates: MarketCandidate[],
    sourceMessageId?: number
  ): Promise<PendingTradeSession> {
    const createdAt = nowIso();
    const session: PendingTradeSession = {
      pendingTradeId: createPendingTradeId(),
      userId,
      chatId,
      sourceMessageId,
      state: 'awaiting_market_selection',
      createdAt,
      expiresAt: addSeconds(createdAt, this.config.trading.confirmTtlSeconds),
      parsedIntent,
      marketCandidates,
      execution: { attemptCount: 0 },
    };
    await this.store.save(session);
    this.auditLogger.event('market_selection_session_created', {
      pendingTradeId: session.pendingTradeId,
      userId,
      candidateCount: marketCandidates.length,
      expiresAt: session.expiresAt,
    });
    return session;
  }

  async getValidSession(pendingTradeId: string): Promise<PendingTradeSession | undefined> {
    const session = await this.store.get(pendingTradeId);
    if (!session) return undefined;

    if (isExpired(session.expiresAt) && !this.isTerminalState(session.state)) {
      session.state = 'expired';
      session.consumedAt = nowIso();
      await this.store.update(session);
      this.auditLogger.event('pending_trade_expired', {
        pendingTradeId,
        previousState: session.state,
      });
    }

    return this.store.get(pendingTradeId);
  }

  async confirm(pendingTradeId: string): Promise<PendingTradeSession | undefined> {
    const existing = await this.getValidSession(pendingTradeId);
    if (!existing) return undefined;
    if (existing.state !== 'awaiting_confirmation') return undefined;

    const updated = await this.store.updateState(pendingTradeId, 'awaiting_confirmation', 'confirmed');
    if (updated) {
      updated.confirmedAt = nowIso();
      await this.store.update(updated);
      this.auditLogger.event('pending_trade_confirmed', { pendingTradeId });
      return updated;
    }
    return undefined;
  }

  async cancel(pendingTradeId: string): Promise<PendingTradeSession | undefined> {
    const existing = await this.store.get(pendingTradeId);
    if (!existing) return undefined;
    if (this.isTerminalState(existing.state)) return existing;

    existing.state = 'cancelled';
    existing.consumedAt = nowIso();
    await this.store.update(existing);
    this.auditLogger.event('pending_trade_cancelled', { pendingTradeId });
    return existing;
  }

  private isTerminalState(state: PendingTradeSession['state']): boolean {
    return ['completed', 'cancelled', 'expired', 'failed', 'unknown'].includes(state);
  }
}
