import type { MarketCandidate, MarketSearchResult } from '../types/market.js';
import { tokenize } from '../utils/text.js';

export class MarketMatchingService {
  match(query: string, candidates: MarketCandidate[]): MarketSearchResult {
    if (candidates.length === 0) {
      return { kind: 'no_match', query, confidence: 0, reason: 'no_live_candidates' };
    }

    const scored = candidates.map((candidate) => ({
      ...candidate,
      matchScore: this.score(query, candidate),
    })).sort((a, b) => b.matchScore - a.matchScore);

    const top = scored[0];
    const second = scored[1];
    const gap = top.matchScore - (second?.matchScore ?? 0);

    if (!top.acceptingOrders) {
      return { kind: 'non_tradable_match', query, confidence: top.matchScore, candidate: top, reason: 'not_accepting_orders' };
    }

    if (top.matchScore >= 0.85 && gap >= 0.1) {
      return { kind: 'safe_match', query, confidence: top.matchScore, topCandidate: top, alternatives: scored.slice(1, 4) };
    }

    if (top.matchScore >= 0.6) {
      return { kind: 'ambiguous_match', query, confidence: top.matchScore, candidates: scored.slice(0, 3), ambiguityReason: gap < 0.1 ? 'scores_too_close' : 'multiple_similar_titles' };
    }

    return { kind: 'no_match', query, confidence: top.matchScore, reason: 'all_candidates_below_threshold' };
  }

  private score(query: string, candidate: MarketCandidate): number {
    const q = tokenize(query);
    const titleTokens = tokenize(`${candidate.title} ${candidate.slug ?? ''} ${candidate.description ?? ''}`);
    const overlap = q.filter((token) => titleTokens.includes(token)).length;
    const overlapScore = q.length > 0 ? overlap / q.length : 0;
    const liquidityScore = Math.min((candidate.liquidity ?? 0) / 10000, 1) * 0.1;
    const activeScore = candidate.active && candidate.acceptingOrders ? 0.1 : 0;
    return Math.min(overlapScore * 0.8 + liquidityScore + activeScore, 1);
  }
}
