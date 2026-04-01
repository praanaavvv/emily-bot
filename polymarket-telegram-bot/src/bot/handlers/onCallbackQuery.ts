import type { Container } from '../../app/container.js';
import type { TelegramCallbackQuery } from '../../types/telegram.js';
import { buildErrorMessage } from '../presenters/errorMessage.js';
import { buildPreviewMessage } from '../presenters/previewMessage.js';
import { buildExecutionResultMessage } from '../presenters/executionResultMessage.js';
import { confirmKeyboard } from '../keyboards/confirmKeyboard.js';

export interface CallbackResponse {
  text: string;
  replyMarkup?: Record<string, unknown>;
}

export async function handleCallbackQuery(container: Container, callback: TelegramCallbackQuery): Promise<CallbackResponse> {
  const data = callback.data;
  if (!data) return { text: buildErrorMessage('Missing callback payload.') };
  const parts = data.split(':');
  const action = parts[0];
  const pendingTradeId = parts[1];
  if (!pendingTradeId) return { text: buildErrorMessage('Invalid callback payload.') };

  const existing = await container.pendingTradeStore.get(pendingTradeId);
  if (!existing) return { text: buildErrorMessage('This confirmation is no longer valid.') };
  if (existing.userId !== String(callback.from.id)) return { text: buildErrorMessage('This confirmation does not belong to you.') };

  if (action === 'cancel_trade') {
    await container.confirmationService.cancel(pendingTradeId);
    return { text: 'Trade cancelled.' };
  }

  if (action === 'select_market') {
    const candidateIndex = Number(parts[2]);
    const candidate = existing.marketCandidates?.[candidateIndex];
    if (!candidate) return { text: buildErrorMessage('Invalid market selection.') };
    const preview = await container.previewService.build(existing.parsedIntent, candidate);
    existing.matchedMarket = candidate;
    existing.preview = preview;
    existing.state = 'awaiting_confirmation';
    await container.pendingTradeStore.update(existing);
    return { text: buildPreviewMessage(existing), replyMarkup: confirmKeyboard(existing.pendingTradeId) };
  }

  if (action === 'confirm_trade') {
    const confirmed = await container.confirmationService.confirm(pendingTradeId);
    if (!confirmed) return { text: buildErrorMessage('This confirmation has already been used or expired.') };
    const result = await container.orderService.execute(pendingTradeId);
    return { text: buildExecutionResultMessage(result) };
  }

  return { text: buildErrorMessage('Unknown callback action.') };
}
