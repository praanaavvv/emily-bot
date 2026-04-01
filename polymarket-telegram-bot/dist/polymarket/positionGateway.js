export class PositionGateway {
    client;
    logger;
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    async getPosition(_marketId, _side) {
        this.logger.warn('position_lookup_stub', { note: 'Replace with Polymarket portfolio/position integration.' });
        return { shares: 100 };
    }
}
