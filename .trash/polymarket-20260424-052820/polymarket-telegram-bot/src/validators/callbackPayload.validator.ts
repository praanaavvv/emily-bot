import { z } from 'zod';

export const callbackPayloadSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('confirm_trade'),
    pendingTradeId: z.string().min(1),
  }),
  z.object({
    action: z.literal('cancel_trade'),
    pendingTradeId: z.string().min(1),
  }),
  z.object({
    action: z.literal('select_market'),
    pendingTradeId: z.string().min(1),
    candidateIndex: z.number().int().nonnegative(),
  }),
]);

export type CallbackPayload = z.infer<typeof callbackPayloadSchema>;
