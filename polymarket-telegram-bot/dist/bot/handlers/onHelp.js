export function helpMessage() {
    return [
        'Supported examples:',
        '- Buy $20 YES on BTC above 100k by June',
        '- Buy 50 USDC NO on Trump winning election',
        '- Sell YES on ETH ETF approval',
        '',
        'The bot always requires confirmation before execution.',
    ].join('\n');
}
