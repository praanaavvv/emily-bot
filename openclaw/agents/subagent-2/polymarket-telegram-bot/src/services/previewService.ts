import type { AppConfig } from '../app/config.js';
import type { MarketCandidate } from '../types/market.js';
import type { ParsedTradeIntent, TradePreview } from '../types/trade.js';
import { BookGateway } from '../polymarket/bookGateway.js';

export class PreviewService {
  constructor(private readonly bookGateway: BookGateway, private readonly config: AppConfig) {}

  async build(intent: ParsedTradeIntent, market: MarketCandidate): Promise<TradePreview> {
    const amount = intent.amount!;
    const tokenId = intent.side === 'yes' ? market.tokenIdYes : market.tokenIdNo;
    const quote = await this.bookGateway.getQuote(tokenId, amount.value);
    return {
      marketTitle: market.title,
      action: intent.action,
      side: intent.side!,
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
