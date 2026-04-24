import { Logger } from './logger.js';

export class AuditLogger {
  constructor(private readonly logger: Logger) {}

  event(event: string, meta?: Record<string, unknown>): void {
    this.logger.info(`audit:${event}`, meta);
  }
}
