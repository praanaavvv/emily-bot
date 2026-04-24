export interface MarketCandidate {
  marketId: string;
  eventId?: string;
  title: string;
  subtitle?: string;
  slug?: string;
  tokenIdYes: string;
  tokenIdNo: string;
  endDate?: string;
  category?: string;
  liquidity?: number;
  volume24h?: number;
  active: boolean;
  closed: boolean;
  acceptingOrders: boolean;
  outcomes?: string[];
  description?: string;
  matchScore: number;
}

export type MarketSearchResult =
  | { kind: 'safe_match'; query: string; confidence: number; topCandidate: MarketCandidate; alternatives: MarketCandidate[] }
  | { kind: 'ambiguous_match'; query: string; confidence: number; candidates: MarketCandidate[]; ambiguityReason: string }
  | { kind: 'no_match'; query: string; confidence: number; reason: string }
  | { kind: 'non_tradable_match'; query: string; confidence: number; candidate: MarketCandidate; reason: string };

export interface OrderBookQuote {
  impliedPrice?: number;
  bestBid?: number;
  bestAsk?: number;
  estimatedShares?: number;
  worstCaseSlippagePct?: number;
  maxSpend?: number;
  fetchedAt: string;
  quoteVersion: string;
}
