import type { PendingTradeSession, PendingTradeState } from '../types/session.js';

export interface PendingTradeStore {
  save(session: PendingTradeSession): Promise<void>;
  get(pendingTradeId: string): Promise<PendingTradeSession | undefined>;
  getActiveByUser(userId: string): Promise<PendingTradeSession[]>;
  updateState(pendingTradeId: string, expected: PendingTradeState, next: PendingTradeState): Promise<PendingTradeSession | undefined>;
  update(session: PendingTradeSession): Promise<void>;
}
