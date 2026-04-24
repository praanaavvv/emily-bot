export function cancelKeyboard(pendingTradeId: string): { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> } {
  return { inline_keyboard: [[{ text: '❌ Cancel', callback_data: `cancel_trade:${pendingTradeId}` }]] };
}
