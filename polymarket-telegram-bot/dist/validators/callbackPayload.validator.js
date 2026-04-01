import { z } from 'zod';
export const callbackPayloadSchema = z.object({
    action: z.enum(['confirm_trade', 'cancel_trade', 'select_market']),
    pendingTradeId: z.string().min(1),
    candidateIndex: z.number().int().nonnegative().optional()
});
