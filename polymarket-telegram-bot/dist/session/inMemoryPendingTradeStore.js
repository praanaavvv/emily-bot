export class InMemoryPendingTradeStore {
    sessions = new Map();
    async save(session) {
        this.sessions.set(session.pendingTradeId, structuredClone(session));
    }
    async get(pendingTradeId) {
        const session = this.sessions.get(pendingTradeId);
        return session ? structuredClone(session) : undefined;
    }
    async getActiveByUser(userId) {
        return Array.from(this.sessions.values())
            .filter((s) => s.userId === userId && ['awaiting_market_selection', 'awaiting_confirmation', 'confirmed', 'executing'].includes(s.state))
            .map((s) => structuredClone(s));
    }
    async updateState(pendingTradeId, expected, next) {
        const session = this.sessions.get(pendingTradeId);
        if (!session || session.state !== expected)
            return undefined;
        session.state = next;
        this.sessions.set(pendingTradeId, session);
        return structuredClone(session);
    }
    async update(session) {
        this.sessions.set(session.pendingTradeId, structuredClone(session));
    }
}
