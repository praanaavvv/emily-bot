import { bootstrap } from './app/bootstrap.js';
import { TelegramBot } from './bot/telegramBot.js';

async function main(): Promise<void> {
  const container = bootstrap();
  const bot = new TelegramBot(container);
  await bot.start();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
