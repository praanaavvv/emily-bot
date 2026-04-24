export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

export class Logger {
  constructor(private readonly level: LogLevel, private readonly pretty: boolean) {}

  private shouldLog(level: LogLevel): boolean {
    return levelOrder[level] >= levelOrder[this.level];
  }

  private emit(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;
    const payload = { ts: new Date().toISOString(), level, message, ...meta };
    if (this.pretty) {
      console.log(`[${payload.ts}] ${level.toUpperCase()} ${message}${meta ? ` ${JSON.stringify(meta)}` : ''}`);
      return;
    }
    console.log(JSON.stringify(payload));
  }

  debug(message: string, meta?: Record<string, unknown>): void { this.emit('debug', message, meta); }
  info(message: string, meta?: Record<string, unknown>): void { this.emit('info', message, meta); }
  warn(message: string, meta?: Record<string, unknown>): void { this.emit('warn', message, meta); }
  error(message: string, meta?: Record<string, unknown>): void { this.emit('error', message, meta); }
}
