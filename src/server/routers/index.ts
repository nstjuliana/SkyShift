/**
 * @fileoverview Root tRPC router
 * @module server/routers/index
 */

import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

/**
 * Health check procedure
 */
const healthCheck = publicProcedure
  .query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  });

/**
 * Root router
 * Merges all feature routers here
 */
export const appRouter = router({
  health: healthCheck,
});

export type AppRouter = typeof appRouter;

