import type { MarketCandidate } from '../types/market.js';
import { MarketGateway } from '../polymarket/marketGateway.js';

export class MarketSearchService {
  constructor(private readonly marketGateway: MarketGateway) {}

  async search(query: string): Promise<MarketCandidate[]> {
    return this.marketGateway.searchLiveMarkets(query);
  }
}
