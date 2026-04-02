import type { AppConfig } from '../app/config.js';
import { Logger } from '../logger/logger.js';
import type { PolymarketOrderStatusResult, PolymarketSubmitOrderPayload, PolymarketSubmitOrderResult } from '../types/polymarket.js';

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

  async submitOrder(payload: PolymarketSubmitOrderPayload): Promise<PolymarketSubmitOrderResult> {
    if (this.config.polymarket.dryRun || this.config.polymarket.paperTrading || this.config.appMode !== 'live' || !this.config.trading.allowLiveExecution) {
      this.logger.warn('submit_order_simulated', {
        mode: this.config.polymarket.paperTrading ? 'paper_trading' : 'dry_run',
        clientOrderId: payload.clientOrderId,
        marketId: payload.marketId,
        tokenId: payload.tokenId,
      });
      return {
        orderId: `sim_${payload.clientOrderId}`,
        status: 'accepted',
        avgPrice: payload.limitPrice ?? 0.5,
        filledShares: payload.shares,
        submittedAt: new Date().toISOString(),
        simulated: true,
        raw: { ...payload },
      };
    }

    this.logger.warn('submit_order_live_not_integrated', {
      note: 'Official Polymarket SDK/order posting must be integrated here before real trading.',
      clientOrderId: payload.clientOrderId,
    });
    throw new Error('Real Polymarket order submission is not integrated in this workspace build yet.');
  }

  async getOrderStatusByClientOrderId(clientOrderId: string): Promise<PolymarketOrderStatusResult> {
    this.logger.warn('order_status_reconciliation_stub', {
      note: 'Replace with real order status lookup by client order id when SDK/API integration is added.',
      clientOrderId,
    });
    return {
      found: false,
      clientOrderId,
      status: 'unknown',
      raw: { stub: true },
    };
  }
}
