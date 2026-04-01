import type { AppConfig } from '../app/config.js';
import { Logger } from '../logger/logger.js';

export class PolymarketClient {
  constructor(private readonly config: AppConfig, private readonly logger: Logger) {}

  async get<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.config.polymarket.gammaUrl}${path}`;
    const response = await fetch(url, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Polymarket GET failed ${response.status}: ${text}`);
    }
    return response.json() as Promise<T>;
  }

  async getClob<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.config.polymarket.clobUrl}${path}`;
    const response = await fetch(url, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Polymarket CLOB GET failed ${response.status}: ${text}`);
    }
    return response.json() as Promise<T>;
  }

  async submitOrder(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
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
