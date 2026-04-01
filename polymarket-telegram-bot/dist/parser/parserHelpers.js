import { normalizeText } from '../utils/text.js';
export function normalizeParserInput(input) {
    return normalizeText(input)
        .replace(/\bwith\b/g, ' ')
        .replace(/\bfor\b/g, ' for ')
        .replace(/\bon\b/g, ' on ')
        .replace(/\s+/g, ' ')
        .trim();
}
export function findFirst(words, input) {
    return words.find((word) => new RegExp(`\\b${word}\\b`, 'i').test(input));
}
