/**
 * @fileoverview tRPC initialization and procedure builders
 * @module server/trpc
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { getServerSession } from '@/lib/auth-server';
import type { Context } from './context';
import type { Session } from 'next-auth';

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

  // Type assertion: after null check, session is guaranteed to be non-null
  const session = ctx.session as Session;

  return next({
    ctx: {
      ...ctx,
      session,
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

