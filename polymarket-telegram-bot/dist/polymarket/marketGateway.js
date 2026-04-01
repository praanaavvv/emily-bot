export class MarketGateway {
    client;
    logger;
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    async searchLiveMarkets(query) {
        const params = new URLSearchParams({ active: 'true', closed: 'false', limit: '50' });
        const markets = await this.client.get(`/markets?${params.toString()}`);
        const normalizedQuery = query.toLowerCase();
        return markets
            .map((market) => this.toCandidate(market))
            .filter((candidate) => candidate !== null)
            .filter((candidate) => candidate.title.toLowerCase().includes(normalizedQuery.split(' ')[0]) || candidate.slug?.toLowerCase().includes(normalizedQuery.split(' ')[0]) || candidate.description?.toLowerCase().includes(normalizedQuery.split(' ')[0]))
            .slice(0, 50);
    }
    toCandidate(market) {
        const tokens = Array.isArray(market.clobTokenIds)
            ? market.clobTokenIds
            : typeof market.clobTokenIds === 'string'
                ? JSON.parse(market.clobTokenIds || '[]')
                : [];
        if (tokens.length < 2 || !market.question)
            return null;
        return {
            marketId: market.id,
            title: market.question,
            slug: market.slug,
            tokenIdYes: tokens[0],
            tokenIdNo: tokens[1],
            endDate: market.endDate,
            category: market.category,
            liquidity: Number(market.liquidity ?? 0),
            volume24h: Number(market.volume24hr ?? market.volume_24hr ?? 0),
            active: Boolean(market.active),
            closed: Boolean(market.closed),
            acceptingOrders: Boolean(market.acceptingOrders ?? market.accepting_orders),
            outcomes: Array.isArray(market.outcomes) ? market.outcomes : typeof market.outcomes === 'string' ? JSON.parse(market.outcomes || '[]') : undefined,
            description: market.description,
            matchScore: 0,
        };
    }
}
