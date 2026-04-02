import { normalizeText, normalizeWhitespace } from '../utils/text.js';

export function normalizeParserInput(input: string): string {
  return normalizeWhitespace(
    normalizeText(input)
      .replace(/[,:;!?]+/g, ' ')
      .replace(/\bbitcoin\b/g, 'btc')
      .replace(/\bethereum\b/g, 'eth')
      .replace(/\bsolana\b/g, 'sol')
      .replace(/\bfederal reserve\b/g, 'fed')
      .replace(/\s+/g, ' ')
  );
}

export function findFirst(words: string[], input: string): string | undefined {
  return words.find((word) => new RegExp(`\\b${escapeRegex(word)}\\b`, 'i').test(input));
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function cleanMarketQuery(input: string): string {
  return normalizeWhitespace(
    input
      .replace(/^\s*(?:on|for|in)\s+/i, ' ')
      .replace(/\s+(?:on|for|in)\s*$/i, ' ')
      .replace(/\s+/g, ' ')
  );
}
