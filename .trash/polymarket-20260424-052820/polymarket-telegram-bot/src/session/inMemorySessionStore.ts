import type { SessionStore } from './sessionStore.js';

export class InMemorySessionStore implements SessionStore {
  private readonly state = new Map<string, string>();

  async setLastPendingTradeId(userId: string, pendingTradeId: string): Promise<void> {
    this.state.set(userId, pendingTradeId);
  }

  async getLastPendingTradeId(userId: string): Promise<string | undefined> {
    return this.state.get(userId);
  }
}
