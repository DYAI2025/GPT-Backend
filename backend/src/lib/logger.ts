import dotenv from 'dotenv';

dotenv.config();

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

class Logger {
    private minLevel: number;

    constructor() {
        const level = (process.env.LOG_LEVEL || 'info') as LogLevel;
        this.minLevel = LOG_LEVELS[level] || LOG_LEVELS.info;
    }

    private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
        if (LOG_LEVELS[level] < this.minLevel) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta,
        };

        const formatted = JSON.stringify(logEntry);

        switch (level) {
            case 'error':
                console.error(formatted);
                break;
            case 'warn':
                console.warn(formatted);
                break;
            default:
                console.log(formatted);
        }
    }

    debug(message: string, meta?: Record<string, unknown>) {
        this.log('debug', message, meta);
    }

    info(message: string, meta?: Record<string, unknown>) {
        this.log('info', message, meta);
    }

    warn(message: string, meta?: Record<string, unknown>) {
        this.log('warn', message, meta);
    }

    error(message: string, meta?: Record<string, unknown>) {
        this.log('error', message, meta);
    }

    // Request logging middleware helper
    requestLog(method: string, path: string, statusCode: number, durationMs: number) {
        this.info('HTTP Request', { method, path, statusCode, durationMs });
    }
}

export const logger = new Logger();
