export class TradingGateway {
    client;
    logger;
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    async submitOrder(payload) {
        this.logger.info('submit_order_request', { clientOrderId: payload.clientOrderId, marketId: payload.marketId, tokenId: payload.tokenId, action: payload.action, side: payload.side, amount: payload.amount });
        return this.client.submitOrder(payload);
    }
}
