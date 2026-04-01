export class PolymarketClient {
    config;
    logger;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    async get(path, init) {
        const url = `${this.config.polymarket.gammaUrl}${path}`;
        const response = await fetch(url, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Polymarket GET failed ${response.status}: ${text}`);
        }
        return response.json();
    }
    async getClob(path, init) {
        const url = `${this.config.polymarket.clobUrl}${path}`;
        const response = await fetch(url, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Polymarket CLOB GET failed ${response.status}: ${text}`);
        }
        return response.json();
    }
    async submitOrder(payload) {
        this.logger.warn('submit_order_stub', { note: 'Replace with official Polymarket TS SDK integration here.' });
        return {
            orderId: `stub_${Date.now()}`,
            status: 'accepted',
            avgPrice: payload['limitPrice'] ?? null,
            filledShares: payload['shares'] ?? null,
            submittedAt: new Date().toISOString(),
            raw: payload,
        };
    }
}
