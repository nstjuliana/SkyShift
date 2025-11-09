/**
 * @fileoverview Zod validation schemas for flight operations
 * @module server/schemas/flight-schemas
 */

import { z } from 'zod';

/**
 * Location schema for departure/destination
 */
const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  icaoCode: z.string().optional(),
});

/**
 * Schema for creating a new flight booking
 * Note: studentId is not included - it comes from the authenticated session
 */
export const createFlightSchema = z.object({
  instructorId: z.string().cuid(),
  scheduledDate: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Scheduled date must be in the future',
  }),
  trainingLevel: z.enum(['STUDENT', 'PRIVATE', 'INSTRUMENT', 'COMMERCIAL']),
  departureLocation: locationSchema,
  destinationLocation: locationSchema.optional(),
  duration: z.number().positive().max(10, 'Duration cannot exceed 10 hours'),
  notes: z.string().max(1000).optional(),
});

/**
 * Schema for updating a flight booking
 */
export const updateFlightSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['SCHEDULED', 'AT_RISK', 'CANCELLED', 'RESCHEDULED', 'COMPLETED']).optional(),
  cancellationProbability: z.number().int().min(0).max(100).optional(),
  riskLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'EXTREME']).optional(),
});

/**
 * Schema for flight list query options
 */
export const flightListOptionsSchema = z.object({
  status: z.enum(['SCHEDULED', 'AT_RISK', 'CANCELLED', 'RESCHEDULED', 'COMPLETED']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

/**
 * Type exports for use in TypeScript
 */
export type CreateFlightInput = z.infer<typeof createFlightSchema>;
export type UpdateFlightInput = z.infer<typeof updateFlightSchema>;
export type FlightListOptions = z.infer<typeof flightListOptionsSchema>;

