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
