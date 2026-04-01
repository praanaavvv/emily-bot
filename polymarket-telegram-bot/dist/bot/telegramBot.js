import { handleMessage } from './handlers/onMessage.js';
import { handleCallbackQuery } from './handlers/onCallbackQuery.js';
import { startMessage } from './handlers/onStart.js';
import { helpMessage } from './handlers/onHelp.js';
export class TelegramBot {
    container;
    offset = 0;
    constructor(container) {
        this.container = container;
    }
    async start() {
        this.container.logger.info('telegram_polling_started');
        for (;;) {
            await this.pollOnce();
            await new Promise((resolve) => setTimeout(resolve, this.container.config.telegram.pollIntervalMs));
        }
    }
    async pollOnce() {
        const updates = await this.api('getUpdates', {
            method: 'POST',
            body: JSON.stringify({ offset: this.offset + 1, timeout: 1 })
        });
        for (const update of updates.result) {
            this.offset = update.update_id;
            try {
                if (update.message)
                    await this.handleIncomingMessage(update.message);
                if (update.callback_query)
                    await this.handleIncomingCallback(update.callback_query);
            }
            catch (error) {
                this.container.logger.error('telegram_update_failed', { error: error instanceof Error ? error.message : 'unknown', updateId: update.update_id });
            }
        }
    }
    async handleIncomingMessage(message) {
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
    async handleIncomingCallback(callback) {
        const response = await handleCallbackQuery(this.container, callback);
        if (callback.message) {
            await this.sendMessage(callback.message.chat.id, response.text, response.replyMarkup);
        }
        await this.answerCallbackQuery(callback.id);
    }
    async sendMessage(chatId, text, reply_markup) {
        await this.api('sendMessage', { method: 'POST', body: JSON.stringify({ chat_id: chatId, text, reply_markup }) });
    }
    async answerCallbackQuery(callbackQueryId) {
        await this.api('answerCallbackQuery', { method: 'POST', body: JSON.stringify({ callback_query_id: callbackQueryId }) });
    }
    async api(method, init) {
        const response = await fetch(`https://api.telegram.org/bot${this.container.config.telegram.token}/${method}`, {
            ...init,
            headers: { 'content-type': 'application/json', ...(init.headers ?? {}) }
        });
        if (!response.ok) {
            throw new Error(`Telegram API ${method} failed with status ${response.status}`);
        }
        return response.json();
    }
}
