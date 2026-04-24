export function confirmKeyboard(pendingTradeId: string): { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> } {
  return {
    inline_keyboard: [[
      { text: '✅ Confirm', callback_data: `confirm_trade:${pendingTradeId}` },
      { text: '❌ Cancel', callback_data: `cancel_trade:${pendingTradeId}` },
    ]],
  };
}
