import type { AppConfig } from '../app/config.js';
import type { PendingTradeSession } from '../types/session.js';
import type { ExecutionFailure } from '../types/trade.js';
import { ageSeconds, isExpired } from '../utils/time.js';

export class ExecutionGuardService {
  constructor(private readonly config: AppConfig) {}

  validate(session: PendingTradeSession): ExecutionFailure | null {
    if (session.state !== 'confirmed') {
      return this.failure(session.pendingTradeId, 'duplicate_execution', 'SESSION_NOT_CONFIRMED', 'Pending trade is not in confirmed state.', false, false);
    }
    if (isExpired(session.expiresAt)) {
      return this.failure(session.pendingTradeId, 'expired_session', 'SESSION_EXPIRED', 'Pending trade confirmation has expired.', false, false);
    }
    if (!session.matchedMarket || !session.preview || !session.parsedIntent.amount || !session.parsedIntent.side) {
      return this.failure(session.pendingTradeId, 'validation_error', 'MISSING_EXECUTION_DATA', 'Pending trade is missing execution data.', false, false);
    }
    if (ageSeconds(session.preview.generatedAt) > this.config.trading.quoteStaleAfterSeconds) {
      return this.failure(session.pendingTradeId, 'validation_error', 'STALE_PREVIEW', 'Preview quote is stale. Please refresh.', true, true);
    }
    if ((session.preview.worstCaseSlippagePct ?? 0) > this.config.trading.defaultMaxSlippagePct) {
      return this.failure(session.pendingTradeId, 'slippage_exceeded', 'SLIPPAGE_EXCEEDED', 'Estimated slippage exceeds configured maximum.', true, true);
    }
    return null;
  }

  private failure(pendingTradeId: string, category: ExecutionFailure['category'], code: string, message: string, retryable: boolean, safeToRetry: boolean): ExecutionFailure {
    return { kind: 'execution_failure', pendingTradeId, category, code, message, retryable, safeToRetry };
  }
}
