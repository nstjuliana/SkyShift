"use strict";
/**
 * @fileoverview tRPC context creation
 * @module server/context
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = createContext;
const auth_server_1 = require("@/lib/auth-server");
const db_1 = require("@/lib/db");
/**
 * Create tRPC context for each request
 *
 * @returns Context object with database and session
 */
async function createContext() {
    const session = await (0, auth_server_1.getServerSession)();
    return {
        db: db_1.db,
        session,
    };
}
