/**
 * @fileoverview tRPC initialization and procedure builders
 * @module server/trpc
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { getServerSession } from '@/lib/auth-server';
import type { Context } from './context';

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create();

/**
 * Base router and procedure
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure that requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
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
export async function getSession() {
  return getServerSession();
}

