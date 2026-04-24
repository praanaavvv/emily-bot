import type { MarketCandidate } from '../../types/market.js';

export function marketOptionsKeyboard(pendingTradeId: string, candidates: MarketCandidate[]): { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> } {
  return {
    inline_keyboard: candidates.map((candidate, index) => ([{ text: candidate.title.slice(0, 60), callback_data: `select_market:${pendingTradeId}:${index}` }]))
  };
}
