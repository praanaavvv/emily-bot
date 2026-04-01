import { createClientOrderId } from '../utils/ids.js';
import { nowIso } from '../utils/time.js';
export class OrderService {
    config;
    store;
    bookGateway;
    tradingGateway;
    executionGuard;
    auditLogger;
    constructor(config, store, bookGateway, tradingGateway, executionGuard, auditLogger) {
        this.config = config;
        this.store = store;
        this.bookGateway = bookGateway;
        this.tradingGateway = tradingGateway;
        this.executionGuard = executionGuard;
        this.auditLogger = auditLogger;
    }
    async execute(pendingTradeId) {
        const session = await this.store.get(pendingTradeId);
        if (!session) {
            return { kind: 'execution_failure', pendingTradeId, category: 'validation_error', code: 'PENDING_TRADE_NOT_FOUND', message: 'Pending trade not found.', retryable: false, safeToRetry: false };
        }
        const guardFailure = this.executionGuard.validate(session);
        if (guardFailure)
            return guardFailure;
        const locked = await this.store.updateState(pendingTradeId, 'confirmed', 'executing');
        if (!locked) {
            return { kind: 'execution_failure', pendingTradeId, category: 'duplicate_execution', code: 'EXECUTION_ALREADY_IN_PROGRESS', message: 'Trade is already executing or completed.', retryable: false, safeToRetry: false };
        }
        const refreshedQuote = await this.bookGateway.getQuote(locked.parsedIntent.side === 'yes' ? locked.matchedMarket.tokenIdYes : locked.matchedMarket.tokenIdNo, locked.parsedIntent.amount.value);
        if ((refreshedQuote.worstCaseSlippagePct ?? 0) > this.config.trading.defaultMaxSlippagePct) {
            locked.state = 'failed';
            await this.store.update(locked);
            return { kind: 'execution_failure', pendingTradeId, category: 'slippage_exceeded', code: 'SLIPPAGE_EXCEEDED_REFRESH', message: 'Slippage exceeded during final validation.', retryable: true, safeToRetry: true };
        }
        const clientOrderId = createClientOrderId(pendingTradeId);
        locked.execution.attemptCount += 1;
        locked.execution.clientOrderId = clientOrderId;
        await this.store.update(locked);
        this.auditLogger.event('trade_execution_started', { pendingTradeId, clientOrderId, marketId: locked.matchedMarket.marketId, side: locked.parsedIntent.side, action: locked.parsedIntent.action });
        try {
            const payload = {
                clientOrderId,
                marketId: locked.matchedMarket.marketId,
                tokenId: locked.parsedIntent.side === 'yes' ? locked.matchedMarket.tokenIdYes : locked.matchedMarket.tokenIdNo,
                side: locked.parsedIntent.side,
                action: locked.parsedIntent.action,
                amount: locked.parsedIntent.amount.value,
                shares: refreshedQuote.estimatedShares,
                orderType: locked.parsedIntent.orderType ?? 'limit',
                limitPrice: refreshedQuote.impliedPrice,
            };
            const raw = await this.tradingGateway.submitOrder(payload);
            locked.state = 'completed';
            locked.execution.orderId = String(raw.orderId ?? raw.id ?? clientOrderId);
            await this.store.update(locked);
            this.auditLogger.event('trade_execution_succeeded', { pendingTradeId, clientOrderId, orderId: locked.execution.orderId });
            return {
                kind: 'execution_success',
                pendingTradeId,
                clientOrderId,
                orderId: locked.execution.orderId,
                status: raw.status ?? 'accepted',
                action: locked.parsedIntent.action,
                side: locked.parsedIntent.side,
                marketId: locked.matchedMarket.marketId,
                tokenId: payload.tokenId,
                requestedAmount: locked.parsedIntent.amount,
                execution: {
                    avgPrice: typeof raw.avgPrice === 'number' ? raw.avgPrice : payload.limitPrice,
                    filledShares: typeof raw.filledShares === 'number' ? raw.filledShares : payload.shares,
                    filledNotional: locked.parsedIntent.amount.value,
                    submittedAt: nowIso(),
                },
                warnings: this.config.appMode !== 'live' ? ['Execution ran through a stubbed Polymarket integration point.'] : [],
            };
        }
        catch (error) {
            locked.state = 'failed';
            locked.execution.lastErrorCode = 'ORDER_SUBMIT_FAILED';
            locked.execution.lastErrorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.store.update(locked);
            this.auditLogger.event('trade_execution_failed', { pendingTradeId, clientOrderId, error: locked.execution.lastErrorMessage });
            return {
                kind: 'execution_failure',
                pendingTradeId,
                clientOrderId,
                category: 'network_error',
                code: 'ORDER_SUBMIT_FAILED',
                message: locked.execution.lastErrorMessage,
                retryable: false,
                safeToRetry: false,
            };
        }
    }
}
