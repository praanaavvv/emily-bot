export class MarketSearchService {
    marketGateway;
    constructor(marketGateway) {
        this.marketGateway = marketGateway;
    }
    async search(query) {
        return this.marketGateway.searchLiveMarkets(query);
    }
}
