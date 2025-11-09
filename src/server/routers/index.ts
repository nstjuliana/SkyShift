/**
 * @fileoverview Root tRPC router
 * @module server/routers/index
 */

import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { flightsRouter } from './flights';
import { weatherRouter } from './weather';
import { airportsRouter } from './airports';
import { usersRouter } from './users';
import { rescheduleRouter } from './reschedule';

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
  flights: flightsRouter,
  weather: weatherRouter,
  airports: airportsRouter,
  users: usersRouter,
  reschedule: rescheduleRouter,
});

export type AppRouter = typeof appRouter;

