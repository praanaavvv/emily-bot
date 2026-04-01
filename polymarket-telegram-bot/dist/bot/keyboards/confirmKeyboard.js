export function confirmKeyboard(pendingTradeId) {
    return {
        inline_keyboard: [[
                { text: '✅ Confirm', callback_data: `confirm_trade:${pendingTradeId}` },
                { text: '❌ Cancel', callback_data: `cancel_trade:${pendingTradeId}` },
            ]],
    };
}
