import { normalizeText } from '../utils/text.js';

export function normalizeParserInput(input: string): string {
  return normalizeText(input)
    .replace(/\bwith\b/g, ' ')
    .replace(/\bfor\b/g, ' for ')
    .replace(/\bon\b/g, ' on ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findFirst(words: string[], input: string): string | undefined {
  return words.find((word) => new RegExp(`\\b${word}\\b`, 'i').test(input));
}
