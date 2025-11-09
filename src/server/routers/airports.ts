/**
 * @fileoverview tRPC router for airport operations
 * @module server/routers/airports
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { airportDBClient } from '@/lib/airportdb';

/**
 * Airport management router
 * Handles airport search operations
 */
export const airportsRouter = router({
  /**
   * Search airports by query string
   * 
   * @returns Array of matching airports
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(2, 'Query must be at least 2 characters'),
        limit: z.number().int().min(1).max(50).default(20).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return airportDBClient.searchAirports(input.query, input.limit);
    }),

  /**
   * Get airport by ICAO code
   * 
   * @returns Airport location or null
   */
  getByICAO: publicProcedure
    .input(
      z.object({
        icaoCode: z.string().length(4, 'ICAO code must be 4 characters'),
      })
    )
    .query(async ({ ctx, input }) => {
      return airportDBClient.getAirportByICAO(input.icaoCode);
    }),
});

