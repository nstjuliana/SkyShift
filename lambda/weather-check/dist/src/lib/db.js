"use strict";
/**
 * @fileoverview Prisma client singleton for database access
 * @module lib/db
 *
 * Prevents multiple Prisma Client instances in development
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
/**
 * Prisma client singleton instance
 * Prevents multiple instances in development hot-reload
 */
exports.db = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.db;
}
