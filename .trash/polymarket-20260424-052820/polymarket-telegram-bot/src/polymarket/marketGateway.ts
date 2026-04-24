import type { MarketCandidate } from '../types/market.js';
import { PolymarketClient } from './polymarketClient.js';
import { Logger } from '../logger/logger.js';

interface GammaMarket {
  id: string;
  question?: string;
  slug?: string;
  endDate?: string;
  active?: boolean;
  closed?: boolean;
  accepting_orders?: boolean;
  acceptingOrders?: boolean;
  liquidity?: string | number;
  volume24hr?: string | number;
  volume_24hr?: string | number;
  outcomes?: string | string[];
  clobTokenIds?: string | string[];
  description?: string;
  category?: string;
}

export class MarketGateway {
  constructor(private readonly client: PolymarketClient, private readonly logger: Logger) {}

  async searchLiveMarkets(query: string): Promise<MarketCandidate[]> {
    const params = new URLSearchParams({ active: 'true', closed: 'false', limit: '50' });
    const markets = await this.client.get<GammaMarket[]>(`/markets?${params.toString()}`);
    const normalizedQuery = query.toLowerCase();
    return markets
      .map((market) => this.toCandidate(market))
      .filter((candidate): candidate is MarketCandidate => candidate !== null)
      .filter((candidate) => candidate.title.toLowerCase().includes(normalizedQuery.split(' ')[0]) || candidate.slug?.toLowerCase().includes(normalizedQuery.split(' ')[0]) || candidate.description?.toLowerCase().includes(normalizedQuery.split(' ')[0]))
      .slice(0, 50);
  }

  private toCandidate(market: GammaMarket): MarketCandidate | null {
    const tokens = Array.isArray(market.clobTokenIds)
      ? market.clobTokenIds
      : typeof market.clobTokenIds === 'string'
        ? JSON.parse(market.clobTokenIds || '[]') as string[]
        : [];
    if (tokens.length < 2 || !market.question) return null;
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
      outcomes: Array.isArray(market.outcomes) ? market.outcomes : typeof market.outcomes === 'string' ? JSON.parse(market.outcomes || '[]') as string[] : undefined,
      description: market.description,
      matchScore: 0,
    };
  }
}
