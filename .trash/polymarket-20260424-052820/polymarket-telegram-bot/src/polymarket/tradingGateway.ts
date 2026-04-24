import { PolymarketClient } from './polymarketClient.js';
import { Logger } from '../logger/logger.js';
import type { PolymarketOrderStatusResult, PolymarketSubmitOrderPayload, PolymarketSubmitOrderResult } from '../types/polymarket.js';

export interface SubmitOrderPayload extends PolymarketSubmitOrderPayload {}

export class TradingGateway {
  constructor(private readonly client: PolymarketClient, private readonly logger: Logger) {}

  async submitOrder(payload: SubmitOrderPayload): Promise<PolymarketSubmitOrderResult> {
    this.logger.info('submit_order_request', {
      clientOrderId: payload.clientOrderId,
      marketId: payload.marketId,
      tokenId: payload.tokenId,
      action: payload.action,
      side: payload.side,
      amount: payload.amount,
      orderType: payload.orderType,
    });
    return this.client.submitOrder(payload);
  }

  async reconcileByClientOrderId(clientOrderId: string): Promise<PolymarketOrderStatusResult> {
    return this.client.getOrderStatusByClientOrderId(clientOrderId);
  }
}
