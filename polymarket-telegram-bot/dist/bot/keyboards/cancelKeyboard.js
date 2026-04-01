export function cancelKeyboard(pendingTradeId) {
    return { inline_keyboard: [[{ text: '❌ Cancel', callback_data: `cancel_trade:${pendingTradeId}` }]] };
}
