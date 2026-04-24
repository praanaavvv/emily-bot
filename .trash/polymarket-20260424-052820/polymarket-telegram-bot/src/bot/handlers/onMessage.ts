import type { Container } from '../../app/container.js';
import type { TelegramMessage } from '../../types/telegram.js';
import { buildPreviewMessage } from '../presenters/previewMessage.js';
import { buildAmbiguityMessage } from '../presenters/ambiguityMessage.js';
import { buildErrorMessage } from '../presenters/errorMessage.js';
import { confirmKeyboard } from '../keyboards/confirmKeyboard.js';
import { marketOptionsKeyboard } from '../keyboards/marketOptionsKeyboard.js';
import { createPendingTradeId } from '../../utils/ids.js';

export interface BotResponse {
  text: string;
  replyMarkup?: Record<string, unknown>;
}

export async function handleMessage(container: Container, message: TelegramMessage): Promise<BotResponse> {
  const text = message.text?.trim();
  if (!text) return { text: 'Send a text command to trade.' };
  if (text === '/start') return { text: 'Emily trading bot is online. Send a trade like: Buy $20 YES on BTC above 100k by June' };
  if (text === '/help') return { text: 'Send a command like: Buy $20 YES on BTC above 100k by June' };

  const parseResult = container.parser.parse(text);
  if (parseResult.kind === 'parse_failed') {
    return { text: buildErrorMessage(parseResult.message) };
  }
  if (parseResult.kind === 'clarification_needed') {
    return { text: buildErrorMessage(parseResult.clarificationQuestion) };
  }

  const candidates = await container.marketSearchService.search(parseResult.marketQuery);
  const matchResult = container.marketMatchingService.match(parseResult.marketQuery, candidates);

  if (matchResult.kind === 'no_match') {
    return { text: buildErrorMessage('I could not find a safe live market match. Try being more specific.') };
  }

  if (matchResult.kind === 'non_tradable_match') {
    return { text: buildErrorMessage(`I found a likely market, but it is not tradable right now: ${matchResult.candidate.title}`) };
  }

  if (matchResult.kind === 'ambiguous_match') {
    const pendingTradeId = createPendingTradeId();
    await container.pendingTradeStore.save({
      pendingTradeId,
      userId: String(message.from?.id ?? message.chat.id),
      chatId: String(message.chat.id),
      sourceMessageId: message.message_id,
      state: 'awaiting_market_selection',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + container.config.trading.confirmTtlSeconds * 1000).toISOString(),
      parsedIntent: parseResult,
      marketCandidates: matchResult.candidates,
      execution: { attemptCount: 0 },
    });
    return {
      text: buildAmbiguityMessage(matchResult.candidates),
      replyMarkup: marketOptionsKeyboard(pendingTradeId, matchResult.candidates),
    };
  }

  const preview = await container.previewService.build(parseResult, matchResult.topCandidate);
  const session = await container.confirmationService.createPendingTrade(String(message.from?.id ?? message.chat.id), String(message.chat.id), parseResult, matchResult.topCandidate, preview, message.message_id);

  return {
    text: buildPreviewMessage(session),
    replyMarkup: confirmKeyboard(session.pendingTradeId),
  };
}
