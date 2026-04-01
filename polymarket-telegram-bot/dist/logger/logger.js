const levelOrder = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
};
export class Logger {
    level;
    pretty;
    constructor(level, pretty) {
        this.level = level;
        this.pretty = pretty;
    }
    shouldLog(level) {
        return levelOrder[level] >= levelOrder[this.level];
    }
    emit(level, message, meta) {
        if (!this.shouldLog(level))
            return;
        const payload = { ts: new Date().toISOString(), level, message, ...meta };
        if (this.pretty) {
            console.log(`[${payload.ts}] ${level.toUpperCase()} ${message}${meta ? ` ${JSON.stringify(meta)}` : ''}`);
            return;
        }
        console.log(JSON.stringify(payload));
    }
    debug(message, meta) { this.emit('debug', message, meta); }
    info(message, meta) { this.emit('info', message, meta); }
    warn(message, meta) { this.emit('warn', message, meta); }
    error(message, meta) { this.emit('error', message, meta); }
}
