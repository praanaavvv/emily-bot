import { PolymarketClient } from './polymarketClient.js';
import { Logger } from '../logger/logger.js';

export class PositionGateway {
  constructor(private readonly client: PolymarketClient, private readonly logger: Logger) {}

  async getPosition(_marketId: string, _side: 'yes' | 'no'): Promise<{ shares: number } | null> {
    this.logger.warn('position_lookup_stub', { note: 'Replace with Polymarket portfolio/position integration.' });
    return { shares: 100 };
  }
}
