import type { Container } from '../app/container.js';
import type { TelegramMessage, TelegramUpdate } from '../types/telegram.js';
import { handleMessage } from './handlers/onMessage.js';
import { handleCallbackQuery } from './handlers/onCallbackQuery.js';
import { startMessage } from './handlers/onStart.js';
import { helpMessage } from './handlers/onHelp.js';

export class TelegramBot {
  private offset = 0;
  constructor(private readonly container: Container) {}

  async start(): Promise<void> {
    this.container.logger.info('telegram_polling_started');
    for (;;) {
      await this.pollOnce();
      await new Promise((resolve) => setTimeout(resolve, this.container.config.telegram.pollIntervalMs));
    }
  }

  private async pollOnce(): Promise<void> {
    const updates = await this.api<{ ok: boolean; result: TelegramUpdate[] }>('getUpdates', {
      method: 'POST',
      body: JSON.stringify({ offset: this.offset + 1, timeout: 1 })
    });
    for (const update of updates.result) {
      this.offset = update.update_id;
      try {
        if (update.message) await this.handleIncomingMessage(update.message);
        if (update.callback_query) await this.handleIncomingCallback(update.callback_query);
      } catch (error) {
        this.container.logger.error('telegram_update_failed', { error: error instanceof Error ? error.message : 'unknown', updateId: update.update_id });
      }
    }
  }

  private async handleIncomingMessage(message: TelegramMessage): Promise<void> {
    if (message.text === '/start') {
      await this.sendMessage(message.chat.id, startMessage());
      return;
    }
    if (message.text === '/help') {
      await this.sendMessage(message.chat.id, helpMessage());
      return;
    }
    const response = await handleMessage(this.container, message);
    await this.sendMessage(message.chat.id, response.text, response.replyMarkup);
  }

  private async handleIncomingCallback(callback: NonNullable<TelegramUpdate['callback_query']>): Promise<void> {
    const response = await handleCallbackQuery(this.container, callback);
    if (callback.message) {
      await this.sendMessage(callback.message.chat.id, response.text, response.replyMarkup);
    }
    await this.answerCallbackQuery(callback.id);
  }

  private async sendMessage(chatId: number, text: string, reply_markup?: Record<string, unknown>): Promise<void> {
    await this.api('sendMessage', { method: 'POST', body: JSON.stringify({ chat_id: chatId, text, reply_markup }) });
  }

  private async answerCallbackQuery(callbackQueryId: string): Promise<void> {
    await this.api('answerCallbackQuery', { method: 'POST', body: JSON.stringify({ callback_query_id: callbackQueryId }) });
  }

  private async api<T>(method: string, init: RequestInit): Promise<T> {
    const response = await fetch(`https://api.telegram.org/bot${this.container.config.telegram.token}/${method}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...(init.headers ?? {}) }
    });
    if (!response.ok) {
      throw new Error(`Telegram API ${method} failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  }
}
