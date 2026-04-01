export function createConfig(env) {
    return {
        nodeEnv: env.NODE_ENV,
        appMode: env.APP_MODE,
        logLevel: env.LOG_LEVEL,
        logPretty: env.LOG_PRETTY,
        telegram: {
            token: env.TELEGRAM_BOT_TOKEN,
            pollIntervalMs: env.TELEGRAM_POLL_INTERVAL_MS,
        },
        polymarket: {
            clobUrl: env.POLYMARKET_CLOB_URL,
            gammaUrl: env.POLYMARKET_GAMMA_URL,
            chainId: env.POLYMARKET_CHAIN_ID,
            privateKey: env.POLYMARKET_PRIVATE_KEY,
            signatureType: env.POLYMARKET_SIGNATURE_TYPE ? Number(env.POLYMARKET_SIGNATURE_TYPE) : undefined,
            funderAddress: env.POLYMARKET_FUNDER_ADDRESS,
            apiKey: env.POLYMARKET_API_KEY,
            apiSecret: env.POLYMARKET_API_SECRET,
            apiPassphrase: env.POLYMARKET_API_PASSPHRASE,
            walletAddress: env.WALLET_ADDRESS,
            rpcUrl: env.RPC_URL,
        },
        trading: {
            confirmTtlSeconds: env.DEFAULT_CONFIRM_TTL_SECONDS,
            defaultMaxSlippagePct: env.DEFAULT_MAX_SLIPPAGE_PCT,
            quoteStaleAfterSeconds: env.QUOTE_STALE_AFTER_SECONDS,
            maxActivePendingTradesPerUser: env.MAX_ACTIVE_PENDING_TRADES_PER_USER,
            allowLiveExecution: env.ALLOW_LIVE_EXECUTION,
            orderSubmitTimeoutMs: env.ORDER_SUBMIT_TIMEOUT_MS,
            readRetryCount: env.READ_RETRY_COUNT,
        },
    };
}
