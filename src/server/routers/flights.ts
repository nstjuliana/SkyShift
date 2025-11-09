/**
 * @fileoverview tRPC router for flight booking operations
 * @module server/routers/flights
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { flightService } from '@/services/flight-service';
import {
  createFlightSchema,
  updateFlightSchema,
  flightListOptionsSchema,
} from '../schemas/flight-schemas';

/**
 * Flight management router
 * Handles all flight booking CRUD operations
 */
export const flightsRouter = router({
  /**
   * List all flights for the authenticated user
   * 
   * @returns Array of flight bookings
   */
  list: protectedProcedure
    .input(flightListOptionsSchema.optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role;
      return flightService.listFlights(userId, userRole, input);
    }),

  /**
   * Get a single flight by ID
   * 
   * @throws TRPCError if flight not found or unauthorized
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role;
      return flightService.getFlightById(input.id, userId, userRole);
    }),

  /**
   * Create a new flight booking
   * 
   * @returns Created flight with generated ID
   */
  create: protectedProcedure
    .input(createFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return flightService.createFlight(userId, input);
    }),

  /**
   * Update flight status and cancellation probability
   * 
   * @returns Updated flight
   */
  updateStatus: protectedProcedure
    .input(updateFlightSchema)
    .mutation(async ({ ctx, input }) => {
      return flightService.updateFlightStatus(input);
    }),
});

