/**
 * @fileoverview Centralized error handling utilities
 * @module lib/error-handler
 * 
 * Provides consistent error handling and formatting across the application
 */

import { logger } from './logger';
import { TRPCError } from '@trpc/server';

/**
 * Error context for logging
 */
export interface ErrorContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  [key: string]: unknown;
}

/**
 * Handles and logs errors consistently
 * 
 * @param error - Error to handle
 * @param context - Additional context for logging
 * @param userMessage - User-friendly error message
 * @returns Formatted error response
 * 
 * @example
 * ```ts
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleError(error, { userId: '123', operation: 'createFlight' }, 'Failed to create flight');
 * }
 * ```
 */
export function handleError(
  error: unknown,
  context: ErrorContext = {},
  userMessage?: string
): { message: string; code: string } {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = error instanceof TRPCError ? error.code : 'INTERNAL_SERVER_ERROR';

  // Log error with context
  logger.error(
    userMessage || errorMessage,
    error instanceof Error ? error : new Error(errorMessage),
    {
      ...context,
      errorCode,
    }
  );

  return {
    message: userMessage || errorMessage,
    code: errorCode,
  };
}

/**
 * Creates a TRPC error with logging
 * 
 * @param code - TRPC error code
 * @param message - Error message
 * @param context - Additional context for logging
 * @returns TRPCError instance
 */
export function createTRPCError(
  code: TRPCError['code'],
  message: string,
  context?: ErrorContext
): TRPCError {
  if (context) {
    logger.error(message, undefined, { ...context, errorCode: code });
  }

  return new TRPCError({
    code,
    message,
  });
}

/**
 * Wraps an async function with error handling
 * 
 * @param fn - Async function to wrap
 * @param context - Error context
 * @returns Wrapped function
 * 
 * @example
 * ```ts
 * const safeOperation = withErrorHandling(
 *   async (data) => await someOperation(data),
 *   { operation: 'someOperation' }
 * );
 * ```
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: ErrorContext = {}
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }) as T;
}

