export class InMemorySessionStore {
    state = new Map();
    async setLastPendingTradeId(userId, pendingTradeId) {
        this.state.set(userId, pendingTradeId);
    }
    async getLastPendingTradeId(userId) {
        return this.state.get(userId);
    }
}
