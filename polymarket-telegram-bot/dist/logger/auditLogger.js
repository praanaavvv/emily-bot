export class AuditLogger {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    event(event, meta) {
        this.logger.info(`audit:${event}`, meta);
    }
}
