export interface SessionStore {
  setLastPendingTradeId(userId: string, pendingTradeId: string): Promise<void>;
  getLastPendingTradeId(userId: string): Promise<string | undefined>;
}
