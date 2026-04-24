export interface PolymarketApiCredentials {
  apiKey?: string;
  apiSecret?: string;
  apiPassphrase?: string;
}

export interface PolymarketClientConfig {
  clobUrl: string;
  gammaUrl: string;
  chainId: number;
  privateKey?: string;
  signatureType?: number;
  funderAddress?: string;
  rpcUrl: string;
  credentials?: PolymarketApiCredentials;
}

export interface PolymarketSubmitOrderPayload {
  clientOrderId: string;
  marketId: string;
  tokenId: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  amount: number;
  shares?: number;
  orderType: 'market' | 'limit';
  limitPrice?: number;
}

export interface PolymarketSubmitOrderResult {
  orderId: string;
  status: 'accepted' | 'filled' | 'partial' | 'rejected' | 'unknown';
  avgPrice?: number;
  filledShares?: number;
  submittedAt: string;
  simulated: boolean;
  raw: Record<string, unknown>;
}

export interface PolymarketOrderStatusResult {
  found: boolean;
  orderId?: string;
  clientOrderId?: string;
  status?: string;
  raw?: Record<string, unknown>;
}
