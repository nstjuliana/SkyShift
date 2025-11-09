"use strict";
/**
 * @fileoverview Centralized error handling utilities
 * @module lib/error-handler
 *
 * Provides consistent error handling and formatting across the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = handleError;
exports.createTRPCError = createTRPCError;
exports.withErrorHandling = withErrorHandling;
const logger_1 = require("./logger");
const server_1 = require("@trpc/server");
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
function handleError(error, context = {}, userMessage) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = error instanceof server_1.TRPCError ? error.code : 'INTERNAL_SERVER_ERROR';
    // Log error with context
    logger_1.logger.error(userMessage || errorMessage, error instanceof Error ? error : new Error(errorMessage), {
        ...context,
        errorCode,
    });
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
function createTRPCError(code, message, context) {
    if (context) {
        logger_1.logger.error(message, undefined, { ...context, errorCode: code });
    }
    return new server_1.TRPCError({
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
function withErrorHandling(fn, context = {}) {
    return (async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            handleError(error, context);
            throw error;
        }
    });
}
