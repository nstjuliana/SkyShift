"use strict";
/**
 * @fileoverview tRPC initialization and procedure builders
 * @module server/trpc
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedProcedure = exports.publicProcedure = exports.router = void 0;
exports.getSession = getSession;
const server_1 = require("@trpc/server");
const auth_server_1 = require("@/lib/auth-server");
/**
 * Initialize tRPC
 */
const t = server_1.initTRPC.context().create();
/**
 * Base router and procedure
 */
exports.router = t.router;
exports.publicProcedure = t.procedure;
/**
 * Protected procedure that requires authentication
 */
exports.protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.session) {
        throw new server_1.TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource',
        });
    }
    return next({
        ctx: {
            ...ctx,
            session: ctx.session,
        },
    });
});
/**
 * Get server session helper
 *
 * @returns Server session or null
 */
async function getSession() {
    return (0, auth_server_1.getServerSession)();
}
