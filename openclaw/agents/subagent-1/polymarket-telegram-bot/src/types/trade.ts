export type AppMode = 'local' | 'paper' | 'live';
export type TradeAction = 'buy' | 'sell';
export type TradeSide = 'yes' | 'no';
export type Currency = 'USDC';
export type OrderType = 'market' | 'limit';

export interface Amount {
  value: number;
  currency: Currency;
}

export interface ParsedTradeIntent {
  kind: 'parsed_trade_intent';
  rawText: string;
  normalizedText: string;
  action: TradeAction;
  side?: TradeSide;
  amount?: Amount;
  marketQuery: string;
  slippagePct?: number;
  orderType?: OrderType;
  confidence: number;
  missingFields: Array<'action' | 'amount' | 'currency' | 'side' | 'marketQuery'>;
  warnings: string[];
}

export interface ClarificationNeeded {
  kind: 'clarification_needed';
  rawText: string;
  normalizedText: string;
  partial: Partial<Omit<ParsedTradeIntent, 'kind' | 'rawText' | 'normalizedText' | 'confidence' | 'missingFields' | 'warnings'>>;
  missingFields: Array<'action' | 'amount' | 'currency' | 'side' | 'marketQuery'>;
  clarificationQuestion: string;
  confidence: number;
  warnings: string[];
}

export interface ParseFailed {
  kind: 'parse_failed';
  rawText: string;
  normalizedText: string;
  reason: 'unsupported_command' | 'conflicting_fields' | 'empty_market_query' | 'unrecognized_trade_intent' | 'invalid_amount';
  message: string;
}

export type ParseResult = ParsedTradeIntent | ClarificationNeeded | ParseFailed;

export interface TradePreview {
  marketTitle: string;
  action: TradeAction;
  side: TradeSide;
  amount: Amount;
  impliedPrice?: number;
  estimatedShares?: number;
  worstCaseSlippagePct?: number;
  maxSpend?: number;
  warningText: string;
  generatedAt: string;
  quoteVersion: string;
}

export interface ExecutionSuccess {
  kind: 'execution_success';
  pendingTradeId: string;
  clientOrderId: string;
  orderId: string;
  status: 'filled' | 'accepted' | 'partial';
  action: TradeAction;
  side: TradeSide;
  marketId: string;
  tokenId: string;
  requestedAmount: Amount;
  execution: {
    avgPrice?: number;
    filledShares?: number;
    filledNotional?: number;
    remainingShares?: number;
    submittedAt: string;
  };
  warnings: string[];
}

export interface ExecutionFailure {
  kind: 'execution_failure';
  pendingTradeId: string;
  clientOrderId?: string;
  category:
    | 'validation_error'
    | 'market_unavailable'
    | 'slippage_exceeded'
    | 'insufficient_balance'
    | 'position_unavailable'
    | 'auth_error'
    | 'network_error'
    | 'exchange_rejection'
    | 'duplicate_execution'
    | 'expired_session'
    | 'unknown_execution_state';
  code: string;
  message: string;
  retryable: boolean;
  safeToRetry: boolean;
  details?: Record<string, unknown>;
}

export type ExecutionResult = ExecutionSuccess | ExecutionFailure;
