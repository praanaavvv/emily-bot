export function marketOptionsKeyboard(pendingTradeId, candidates) {
    return {
        inline_keyboard: candidates.map((candidate, index) => ([{ text: candidate.title.slice(0, 60), callback_data: `select_market:${pendingTradeId}:${index}` }]))
    };
}
