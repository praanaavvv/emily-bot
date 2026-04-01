import { z } from 'zod';
export const tradeIntentSchema = z.object({
    kind: z.literal('parsed_trade_intent'),
    rawText: z.string(),
    normalizedText: z.string(),
    action: z.enum(['buy', 'sell']),
    side: z.enum(['yes', 'no']).optional(),
    amount: z.object({ value: z.number().positive(), currency: z.literal('USDC') }).optional(),
    marketQuery: z.string().min(1),
    slippagePct: z.number().positive().max(100).optional(),
    orderType: z.enum(['market', 'limit']).optional(),
    confidence: z.number().min(0).max(1),
    missingFields: z.array(z.enum(['action', 'amount', 'currency', 'side', 'marketQuery'])),
    warnings: z.array(z.string())
});
