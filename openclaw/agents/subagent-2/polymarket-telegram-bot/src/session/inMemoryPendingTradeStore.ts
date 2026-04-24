import type { PendingTradeStore } from './pendingTradeStore.js';
import type { PendingTradeSession, PendingTradeState } from '../types/session.js';

export class InMemoryPendingTradeStore implements PendingTradeStore {
  private readonly sessions = new Map<string, PendingTradeSession>();

  async save(session: PendingTradeSession): Promise<void> {
    this.sessions.set(session.pendingTradeId, structuredClone(session));
  }

  async get(pendingTradeId: string): Promise<PendingTradeSession | undefined> {
    const session = this.sessions.get(pendingTradeId);
    return session ? structuredClone(session) : undefined;
  }

  async getActiveByUser(userId: string): Promise<PendingTradeSession[]> {
    return Array.from(this.sessions.values())
      .filter((s) => s.userId === userId && ['awaiting_market_selection', 'awaiting_confirmation', 'confirmed', 'executing'].includes(s.state))
      .map((s) => structuredClone(s));
  }

  async updateState(pendingTradeId: string, expected: PendingTradeState, next: PendingTradeState): Promise<PendingTradeSession | undefined> {
    const session = this.sessions.get(pendingTradeId);
    if (!session || session.state !== expected) return undefined;
    session.state = next;
    this.sessions.set(pendingTradeId, session);
    return structuredClone(session);
  }

  async update(session: PendingTradeSession): Promise<void> {
    this.sessions.set(session.pendingTradeId, structuredClone(session));
  }
}
