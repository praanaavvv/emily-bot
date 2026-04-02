import type { AppConfig } from './config.js';
import { Logger } from '../logger/logger.js';
import { AuditLogger } from '../logger/auditLogger.js';
import { CommandParser } from '../parser/commandParser.js';
import { InMemoryPendingTradeStore } from '../session/inMemoryPendingTradeStore.js';
import { RedisPendingTradeStore } from '../session/redisPendingTradeStore.js';
import type { PendingTradeStore } from '../session/pendingTradeStore.js';
import { InMemorySessionStore } from '../session/inMemorySessionStore.js';
import { PolymarketClient } from '../polymarket/polymarketClient.js';
import { MarketGateway } from '../polymarket/marketGateway.js';
import { BookGateway } from '../polymarket/bookGateway.js';
import { TradingGateway } from '../polymarket/tradingGateway.js';
import { PositionGateway } from '../polymarket/positionGateway.js';
import { MarketSearchService } from '../services/marketSearchService.js';
import { MarketMatchingService } from '../services/marketMatchingService.js';
import { PreviewService } from '../services/previewService.js';
import { ConfirmationService } from '../services/confirmationService.js';
import { ExecutionGuardService } from '../services/executionGuardService.js';
import { OrderService } from '../services/orderService.js';

export interface Container {
  config: AppConfig;
  logger: Logger;
  auditLogger: AuditLogger;
  parser: CommandParser;
  pendingTradeStore: PendingTradeStore;
  sessionStore: InMemorySessionStore;
  polymarketClient: PolymarketClient;
  marketGateway: MarketGateway;
  bookGateway: BookGateway;
  tradingGateway: TradingGateway;
  positionGateway: PositionGateway;
  marketSearchService: MarketSearchService;
  marketMatchingService: MarketMatchingService;
  previewService: PreviewService;
  confirmationService: ConfirmationService;
  executionGuardService: ExecutionGuardService;
  orderService: OrderService;
}

export function createContainer(config: AppConfig): Container {
  const logger = new Logger(config.logLevel, config.logPretty);
  const auditLogger = new AuditLogger(logger);
  const parser = new CommandParser();
  const pendingTradeStore: PendingTradeStore = process.env.REDIS_URL
    ? new RedisPendingTradeStore(process.env.REDIS_URL)
    : new InMemoryPendingTradeStore();
  const sessionStore = new InMemorySessionStore();
  const polymarketClient = new PolymarketClient(config, logger);
  const marketGateway = new MarketGateway(polymarketClient, logger);
  const bookGateway = new BookGateway(polymarketClient, logger);
  const tradingGateway = new TradingGateway(polymarketClient, logger);
  const positionGateway = new PositionGateway(polymarketClient, logger);
  const marketSearchService = new MarketSearchService(marketGateway);
  const marketMatchingService = new MarketMatchingService();
  const previewService = new PreviewService(bookGateway, config);
  const confirmationService = new ConfirmationService(config, pendingTradeStore, auditLogger);
  const executionGuardService = new ExecutionGuardService(config);
  const orderService = new OrderService(config, pendingTradeStore, bookGateway, tradingGateway, executionGuardService, auditLogger);

  logger.info('pending_trade_store_selected', { store: process.env.REDIS_URL ? 'redis' : 'memory' });

  return {
    config,
    logger,
    auditLogger,
    parser,
    pendingTradeStore,
    sessionStore,
    polymarketClient,
    marketGateway,
    bookGateway,
    tradingGateway,
    positionGateway,
    marketSearchService,
    marketMatchingService,
    previewService,
    confirmationService,
    executionGuardService,
    orderService,
  };
}
