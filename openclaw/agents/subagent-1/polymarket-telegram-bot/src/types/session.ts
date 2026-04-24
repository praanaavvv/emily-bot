import type { MarketCandidate } from './market.js';
import type { ParsedTradeIntent, TradePreview } from './trade.js';

export type PendingTradeState =
  | 'awaiting_market_selection'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'executing'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'failed'
  | 'unknown';

export interface PendingTradeSession {
  pendingTradeId: string;
  userId: string;
  chatId: string;
  sourceMessageId?: number;
  state: PendingTradeState;
  createdAt: string;
  expiresAt: string;
  confirmedAt?: string;
  consumedAt?: string;
  parsedIntent: ParsedTradeIntent;
  marketCandidates?: MarketCandidate[];
  matchedMarket?: MarketCandidate;
  preview?: TradePreview;
  execution: {
    attemptCount: number;
    clientOrderId?: string;
    orderId?: string;
    lastErrorCode?: string;
    lastErrorMessage?: string;
  };
}
