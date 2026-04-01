import { PolymarketClient } from './polymarketClient.js';
import { Logger } from '../logger/logger.js';

export interface SubmitOrderPayload {
  clientOrderId: string;
  marketId: string;
  tokenId: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  amount: number;
  shares?: number;
  orderType: 'market' | 'limit';
  limitPrice?: number;
}

export class TradingGateway {
  constructor(private readonly client: PolymarketClient, private readonly logger: Logger) {}

  async submitOrder(payload: SubmitOrderPayload): Promise<Record<string, unknown>> {
    this.logger.info('submit_order_request', { clientOrderId: payload.clientOrderId, marketId: payload.marketId, tokenId: payload.tokenId, action: payload.action, side: payload.side, amount: payload.amount });
    return this.client.submitOrder(payload as unknown as Record<string, unknown>);
  }
}
