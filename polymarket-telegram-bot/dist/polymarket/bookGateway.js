import { createQuoteVersion } from '../utils/ids.js';
export class BookGateway {
    client;
    logger;
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    async getQuote(tokenId, amount) {
        try {
            const book = await this.client.getClob(`/book?token_id=${encodeURIComponent(tokenId)}`);
            const bestAsk = book.asks?.[0] ? Number(book.asks[0].price) : undefined;
            const bestBid = book.bids?.[0] ? Number(book.bids[0].price) : undefined;
            const impliedPrice = bestAsk ?? bestBid;
            const estimatedShares = impliedPrice && impliedPrice > 0 ? amount / impliedPrice : undefined;
            return {
                impliedPrice,
                bestAsk,
                bestBid,
                estimatedShares,
                worstCaseSlippagePct: 1.5,
                maxSpend: amount * 1.015,
                fetchedAt: new Date().toISOString(),
                quoteVersion: createQuoteVersion(),
            };
        }
        catch (error) {
            this.logger.warn('book_quote_fallback', { error: error instanceof Error ? error.message : 'unknown' });
            return {
                impliedPrice: undefined,
                estimatedShares: undefined,
                worstCaseSlippagePct: undefined,
                maxSpend: undefined,
                fetchedAt: new Date().toISOString(),
                quoteVersion: createQuoteVersion(),
            };
        }
    }
}
