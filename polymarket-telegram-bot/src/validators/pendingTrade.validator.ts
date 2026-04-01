import { z } from 'zod';

export const pendingTradeValidator = z.object({
  pendingTradeId: z.string().min(1),
  userId: z.string().min(1),
  chatId: z.string().min(1),
  state: z.enum(['awaiting_market_selection', 'awaiting_confirmation', 'confirmed', 'executing', 'completed', 'cancelled', 'expired', 'failed', 'unknown']),
  createdAt: z.string().min(1),
  expiresAt: z.string().min(1)
});
