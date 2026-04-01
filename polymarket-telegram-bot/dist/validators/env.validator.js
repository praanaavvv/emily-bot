import { z } from 'zod';
const boolFromString = z.preprocess((value) => {
    if (typeof value === 'boolean')
        return value;
    return value === 'true';
}, z.boolean());
export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_MODE: z.enum(['local', 'paper', 'live']).default('local'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    LOG_PRETTY: boolFromString.default(true),
    TELEGRAM_BOT_TOKEN: z.string().min(1),
    TELEGRAM_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(1500),
    POLYMARKET_CLOB_URL: z.string().url(),
    POLYMARKET_GAMMA_URL: z.string().url(),
    POLYMARKET_CHAIN_ID: z.coerce.number().int().positive().default(137),
    POLYMARKET_PRIVATE_KEY: z.string().optional(),
    POLYMARKET_SIGNATURE_TYPE: z.string().optional(),
    POLYMARKET_FUNDER_ADDRESS: z.string().optional(),
    POLYMARKET_API_KEY: z.string().optional(),
    POLYMARKET_API_SECRET: z.string().optional(),
    POLYMARKET_API_PASSPHRASE: z.string().optional(),
    WALLET_ADDRESS: z.string().optional(),
    RPC_URL: z.string().url(),
    DEFAULT_CONFIRM_TTL_SECONDS: z.coerce.number().int().positive().default(45),
    DEFAULT_MAX_SLIPPAGE_PCT: z.coerce.number().positive().default(2),
    QUOTE_STALE_AFTER_SECONDS: z.coerce.number().int().positive().default(20),
    MAX_ACTIVE_PENDING_TRADES_PER_USER: z.coerce.number().int().positive().default(1),
    ALLOW_LIVE_EXECUTION: boolFromString.default(false),
    ORDER_SUBMIT_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
    READ_RETRY_COUNT: z.coerce.number().int().nonnegative().default(2),
    REDIS_URL: z.string().optional(),
    DATABASE_URL: z.string().optional(),
    SENTRY_DSN: z.string().optional(),
}).superRefine((env, ctx) => {
    if (env.APP_MODE === 'live') {
        if (!env.ALLOW_LIVE_EXECUTION) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ALLOW_LIVE_EXECUTION'], message: 'APP_MODE=live requires ALLOW_LIVE_EXECUTION=true' });
        }
        if (!env.POLYMARKET_PRIVATE_KEY) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['POLYMARKET_PRIVATE_KEY'], message: 'POLYMARKET_PRIVATE_KEY is required in live mode' });
        }
    }
});
