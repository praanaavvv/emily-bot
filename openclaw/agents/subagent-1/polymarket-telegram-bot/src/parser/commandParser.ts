import { amountPatterns, limitOrderPattern, marketNoisePatterns, marketOrderPattern, slippagePattern } from './parserRules.js';
import { BUY_WORDS, NO_WORDS, SELL_WORDS, YES_WORDS } from './parser.types.js';
import { cleanMarketQuery, findFirst, normalizeParserInput } from './parserHelpers.js';
import type { ClarificationNeeded, ParseFailed, ParseResult, ParsedTradeIntent, TradeAction, TradeSide } from '../types/trade.js';
import { removeMatched } from '../utils/text.js';

export class CommandParser {
  parse(rawText: string): ParseResult {
    const normalizedText = normalizeParserInput(rawText);

    const actionWord = findFirst(BUY_WORDS, normalizedText) ?? findFirst(SELL_WORDS, normalizedText);
    const buyWord = findFirst(BUY_WORDS, normalizedText);
    const sellWord = findFirst(SELL_WORDS, normalizedText);
    if (buyWord && sellWord) {
      return this.parseFailed(rawText, normalizedText, 'conflicting_fields', 'Message contains conflicting buy and sell instructions.');
    }

    const sideYes = findFirst(YES_WORDS, normalizedText);
    const sideNo = findFirst(NO_WORDS, normalizedText);
    if (sideYes && sideNo) {
      return this.parseFailed(rawText, normalizedText, 'conflicting_fields', 'Message contains both YES and NO.');
    }

    const action: TradeAction | undefined = actionWord ? (BUY_WORDS.includes(actionWord) ? 'buy' : 'sell') : undefined;
    const side: TradeSide | undefined = sideYes ? 'yes' : sideNo ? 'no' : undefined;

    let amountValue: number | undefined;
    for (const pattern of amountPatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        amountValue = Number(match[1]);
        break;
      }
    }
    if (amountValue !== undefined && (!Number.isFinite(amountValue) || amountValue <= 0)) {
      return this.parseFailed(rawText, normalizedText, 'invalid_amount', 'Amount must be a positive number.');
    }

    const slippageMatch = normalizedText.match(slippagePattern);
    const slippagePct = slippageMatch ? Number(slippageMatch[1]) : undefined;
    const orderType = marketOrderPattern.test(normalizedText) ? 'market' : limitOrderPattern.test(normalizedText) ? 'limit' : undefined;

    const marketQuery = cleanMarketQuery(removeMatched(normalizedText, marketNoisePatterns));

    const warnings: string[] = [];
    if (normalizedText.includes('long') && action === 'buy') warnings.push("Mapped 'long' to buy.");
    if (normalizedText.includes('ape') && action === 'buy') warnings.push("Mapped 'ape' to buy.");
    if (normalizedText.includes('short')) warnings.push("'short' was not mapped automatically because it is ambiguous for Polymarket.");

    const missingFields: ParsedTradeIntent['missingFields'] = [];
    if (!action) missingFields.push('action');
    if (!side) missingFields.push('side');
    if (!amountValue) {
      if (action === 'buy') missingFields.push('amount', 'currency');
      if (action === 'sell') missingFields.push('amount');
      if (!action) missingFields.push('amount', 'currency');
    }
    if (!marketQuery) missingFields.push('marketQuery');

    if (missingFields.length > 0) {
      return this.clarification(rawText, normalizedText, {
        action,
        side,
        amount: amountValue ? { value: amountValue, currency: 'USDC' } : undefined,
        marketQuery: marketQuery || undefined,
        slippagePct,
        orderType,
      }, missingFields, warnings);
    }

    return {
      kind: 'parsed_trade_intent',
      rawText,
      normalizedText,
      action: action!,
      side,
      amount: { value: amountValue!, currency: 'USDC' },
      marketQuery,
      slippagePct,
      orderType,
      confidence: 0.92,
      missingFields: [],
      warnings,
    };
  }

  private clarification(
    rawText: string,
    normalizedText: string,
    partial: ClarificationNeeded['partial'],
    missingFields: ClarificationNeeded['missingFields'],
    warnings: string[]
  ): ClarificationNeeded {
    let clarificationQuestion = 'Please clarify your trade request.';
    if (missingFields.includes('side') && missingFields.includes('amount')) clarificationQuestion = 'Do you want YES or NO, and how much do you want to trade?';
    else if (missingFields.includes('side')) clarificationQuestion = 'Do you want YES or NO?';
    else if (missingFields.includes('amount')) clarificationQuestion = partial.action === 'sell' ? 'How much do you want to sell?' : 'How much do you want to spend?';
    else if (missingFields.includes('marketQuery')) clarificationQuestion = 'Which market do you want to trade?';
    else if (missingFields.includes('action')) clarificationQuestion = 'Do you want to buy or sell?';
    return {
      kind: 'clarification_needed',
      rawText,
      normalizedText,
      partial,
      missingFields,
      clarificationQuestion,
      confidence: 0.65,
      warnings,
    };
  }

  private parseFailed(rawText: string, normalizedText: string, reason: ParseFailed['reason'], message: string): ParseFailed {
    return { kind: 'parse_failed', rawText, normalizedText, reason, message };
  }
}
