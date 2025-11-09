/**
 * @fileoverview tRPC router for weather operations
 * @module server/routers/weather
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { weatherService } from '@/services/weather-service';

/**
 * Weather management router
 * Handles weather checking and retrieval
 */
export const weatherRouter = router({
  /**
   * Check weather for a specific flight
   * 
   * @returns Weather check result with updated booking
   */
  checkFlight: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return weatherService.checkFlightWeather(input.bookingId);
    }),

  /**
   * Check weather for all upcoming flights
   * 
   * @returns Summary of checks performed
   */
  checkAllFlights: protectedProcedure.mutation(async ({ ctx }) => {
    return weatherService.checkUpcomingFlights();
  }),

  /**
   * Get latest weather data for a flight
   * 
   * @returns Latest weather log entry
   */
  getFlightWeather: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const weatherLog = await ctx.db.weatherLog.findFirst({
        where: { bookingId: input.bookingId },
        orderBy: { checkedAt: 'desc' },
      });

      return weatherLog;
    }),
});

