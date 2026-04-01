export class PreviewService {
    bookGateway;
    config;
    constructor(bookGateway, config) {
        this.bookGateway = bookGateway;
        this.config = config;
    }
    async build(intent, market) {
        const amount = intent.amount;
        const tokenId = intent.side === 'yes' ? market.tokenIdYes : market.tokenIdNo;
        const quote = await this.bookGateway.getQuote(tokenId, amount.value);
        return {
            marketTitle: market.title,
            action: intent.action,
            side: intent.side,
            amount,
            impliedPrice: quote.impliedPrice,
            estimatedShares: quote.estimatedShares,
            worstCaseSlippagePct: quote.worstCaseSlippagePct,
            maxSpend: quote.maxSpend,
            warningText: quote.worstCaseSlippagePct && quote.worstCaseSlippagePct > this.config.trading.defaultMaxSlippagePct
                ? 'Estimated slippage exceeds configured cap.'
                : `Price may move before execution. Confirmation expires in ${this.config.trading.confirmTtlSeconds}s.`,
            generatedAt: quote.fetchedAt,
            quoteVersion: quote.quoteVersion,
        };
    }
}
