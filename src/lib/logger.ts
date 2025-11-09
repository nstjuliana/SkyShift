/**
 * @fileoverview Structured logging utility for production
 * @module lib/logger
 * 
 * Provides structured JSON logging for CloudWatch and other log aggregators
 */

/**
 * Log levels
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * Structured logger
 * Outputs JSON-formatted logs for easy parsing in CloudWatch
 */
export const logger = {
  /**
   * Log an info message
   * 
   * @param message - Log message
   * @param meta - Additional metadata
   * 
   * @example
   * ```ts
   * logger.info('User logged in', { userId: '123', email: 'user@example.com' });
   * ```
   */
  info: (message: string, meta?: Record<string, unknown>) => {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    console.log(JSON.stringify(entry));
  },

  /**
   * Log a warning message
   * 
   * @param message - Log message
   * @param meta - Additional metadata
   * 
   * @example
   * ```ts
   * logger.warn('API rate limit approaching', { remaining: 10 });
   * ```
   */
  warn: (message: string, meta?: Record<string, unknown>) => {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    console.warn(JSON.stringify(entry));
  },

  /**
   * Log an error message
   * 
   * @param message - Log message
   * @param error - Error object (optional)
   * @param meta - Additional metadata
   * 
   * @example
   * ```ts
   * logger.error('Failed to send email', error, { userId: '123' });
   * ```
   */
  error: (message: string, error?: Error | unknown, meta?: Record<string, unknown>) => {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      ...(error instanceof Error
        ? {
            error: error.message,
            stack: error.stack,
            errorName: error.name,
          }
        : error
        ? { error: String(error) }
        : {}),
      ...meta,
    };
    console.error(JSON.stringify(entry));
  },

  /**
   * Log a debug message (only in development)
   * 
   * @param message - Log message
   * @param meta - Additional metadata
   * 
   * @example
   * ```ts
   * logger.debug('Cache hit', { key: 'weather:123' });
   * ```
   */
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      const entry: LogEntry = {
        level: 'debug',
        message,
        timestamp: new Date().toISOString(),
        ...meta,
      };
      console.debug(JSON.stringify(entry));
    }
  },
};

