import type { Container } from '../../app/container.js';
import type { TelegramCallbackQuery } from '../../types/telegram.js';
import { callbackPayloadSchema, type CallbackPayload } from '../../validators/callbackPayload.validator.js';
import {
  buildErrorMessage,
  duplicateConfirmationMessage,
  invalidCallbackMessage,
  invalidMarketSelectionMessage,
  ownershipMismatchMessage,
  staleConfirmationMessage,
  unknownSessionMessage,
} from '../presenters/errorMessage.js';
import { buildPreviewMessage } from '../presenters/previewMessage.js';
import { buildExecutionResultMessage } from '../presenters/executionResultMessage.js';
import { confirmKeyboard } from '../keyboards/confirmKeyboard.js';

export interface CallbackResponse {
  text: string;
  replyMarkup?: Record<string, unknown>;
}

function parseCallbackPayload(raw: string): CallbackPayload | null {
  const parts = raw.split(':');
  const action = parts[0];

  if (action === 'confirm_trade' || action === 'cancel_trade') {
    const parsed = callbackPayloadSchema.safeParse({
      action,
      pendingTradeId: parts[1],
    });
    return parsed.success ? parsed.data : null;
  }

  if (action === 'select_market') {
    const parsed = callbackPayloadSchema.safeParse({
      action,
      pendingTradeId: parts[1],
      candidateIndex: Number(parts[2]),
    });
    return parsed.success ? parsed.data : null;
  }

  return null;
}

export async function handleCallbackQuery(container: Container, callback: TelegramCallbackQuery): Promise<CallbackResponse> {
  const rawData = callback.data;
  if (!rawData) {
    return { text: invalidCallbackMessage() };
  }

  const payload = parseCallbackPayload(rawData);
  if (!payload) {
    container.logger.warn('invalid_callback_payload', {
      rawData,
      userId: callback.from.id,
      callbackId: callback.id,
    });
    return { text: invalidCallbackMessage() };
  }

  const session = await container.confirmationService.getValidSession(payload.pendingTradeId);
  if (!session) {
    return { text: unknownSessionMessage() };
  }

  if (session.userId !== String(callback.from.id)) {
    container.logger.warn('callback_ownership_mismatch', {
      pendingTradeId: payload.pendingTradeId,
      sessionUserId: session.userId,
      callbackUserId: String(callback.from.id),
    });
    return { text: ownershipMismatchMessage() };
  }

  if (payload.action === 'cancel_trade') {
    const cancelled = await container.confirmationService.cancel(payload.pendingTradeId);
    if (!cancelled) return { text: unknownSessionMessage() };
    return { text: 'Trade cancelled.' };
  }

  if (session.state === 'expired') {
    return { text: staleConfirmationMessage() };
  }

  if (payload.action === 'select_market') {
    if (session.state !== 'awaiting_market_selection') {
      return { text: buildErrorMessage('That market selection is no longer valid.') };
    }

    const candidate = session.marketCandidates?.[payload.candidateIndex];
    if (!candidate) {
      return { text: invalidMarketSelectionMessage() };
    }

    const preview = await container.previewService.build(session.parsedIntent, candidate);
    session.matchedMarket = candidate;
    session.preview = preview;
    session.state = 'awaiting_confirmation';
    await container.pendingTradeStore.update(session);

    return {
      text: buildPreviewMessage(session),
      replyMarkup: confirmKeyboard(session.pendingTradeId),
    };
  }

  if (payload.action === 'confirm_trade') {
    if (session.state === 'executing' || session.state === 'completed') {
      return { text: duplicateConfirmationMessage() };
    }

    if (session.state !== 'awaiting_confirmation') {
      return { text: buildErrorMessage('That confirmation is not in a confirmable state anymore.') };
    }

    const confirmed = await container.confirmationService.confirm(payload.pendingTradeId);
    if (!confirmed) {
      const latest = await container.confirmationService.getValidSession(payload.pendingTradeId);
      if (latest?.state === 'expired') return { text: staleConfirmationMessage() };
      return { text: duplicateConfirmationMessage() };
    }

    const result = await container.orderService.execute(payload.pendingTradeId);
    return { text: buildExecutionResultMessage(result) };
  }

  return { text: buildErrorMessage('Unknown callback action.') };
}
