import { createClient, type RedisClientType } from 'redis';
import type { PendingTradeStore } from './pendingTradeStore.js';
import type { PendingTradeSession, PendingTradeState } from '../types/session.js';

export class RedisPendingTradeStore implements PendingTradeStore {
  private client: RedisClientType;
  private ready: Promise<void>;

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });
    this.ready = this.client.connect().then(() => undefined);
  }

  private key(id: string): string {
    return `pending_trade:${id}`;
  }

  private activeKey(userId: string): string {
    return `pending_trade_active:${userId}`;
  }

  async save(session: PendingTradeSession): Promise<void> {
    await this.ready;
    await this.client.set(this.key(session.pendingTradeId), JSON.stringify(session));
    if (['awaiting_market_selection', 'awaiting_confirmation', 'confirmed', 'executing'].includes(session.state)) {
      await this.client.sAdd(this.activeKey(session.userId), session.pendingTradeId);
    }
  }

  async get(pendingTradeId: string): Promise<PendingTradeSession | undefined> {
    await this.ready;
    const raw = await this.client.get(this.key(pendingTradeId));
    return raw ? JSON.parse(raw) as PendingTradeSession : undefined;
  }

  async getActiveByUser(userId: string): Promise<PendingTradeSession[]> {
    await this.ready;
    const ids = await this.client.sMembers(this.activeKey(userId));
    const sessions = await Promise.all(ids.map((id) => this.get(id)));
    return sessions.filter((s): s is PendingTradeSession => Boolean(s) && ['awaiting_market_selection', 'awaiting_confirmation', 'confirmed', 'executing'].includes(s!.state));
  }

  async updateState(pendingTradeId: string, expected: PendingTradeState, next: PendingTradeState): Promise<PendingTradeSession | undefined> {
    await this.ready;
    const session = await this.get(pendingTradeId);
    if (!session || session.state !== expected) return undefined;
    session.state = next;
    await this.update(session);
    return session;
  }

  async update(session: PendingTradeSession): Promise<void> {
    await this.ready;
    await this.client.set(this.key(session.pendingTradeId), JSON.stringify(session));
    if (['awaiting_market_selection', 'awaiting_confirmation', 'confirmed', 'executing'].includes(session.state)) {
      await this.client.sAdd(this.activeKey(session.userId), session.pendingTradeId);
    } else {
      await this.client.sRem(this.activeKey(session.userId), session.pendingTradeId);
    }
  }
}
