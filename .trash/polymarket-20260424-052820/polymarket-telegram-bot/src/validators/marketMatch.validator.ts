import { z } from 'zod';

export const marketCandidateSchema = z.object({
  marketId: z.string().min(1),
  title: z.string().min(1),
  tokenIdYes: z.string().min(1),
  tokenIdNo: z.string().min(1),
  active: z.boolean(),
  closed: z.boolean(),
  acceptingOrders: z.boolean(),
  matchScore: z.number().min(0).max(1)
});
