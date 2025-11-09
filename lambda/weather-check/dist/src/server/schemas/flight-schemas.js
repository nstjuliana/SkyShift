"use strict";
/**
 * @fileoverview Zod validation schemas for flight operations
 * @module server/schemas/flight-schemas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightListOptionsSchema = exports.updateFlightSchema = exports.createFlightSchema = void 0;
const zod_1 = require("zod");
/**
 * Location schema for departure/destination
 */
const locationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Location name is required'),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    icaoCode: zod_1.z.string().optional(),
});
/**
 * Schema for creating a new flight booking
 * Note: studentId is not included - it comes from the authenticated session
 */
exports.createFlightSchema = zod_1.z.object({
    instructorId: zod_1.z.string().cuid(),
    scheduledDate: zod_1.z.coerce.date().refine((date) => date > new Date(), {
        message: 'Scheduled date must be in the future',
    }),
    trainingLevel: zod_1.z.enum(['STUDENT', 'PRIVATE', 'INSTRUMENT', 'COMMERCIAL']),
    departureLocation: locationSchema,
    destinationLocation: locationSchema.optional(),
    duration: zod_1.z.number().positive().max(10, 'Duration cannot exceed 10 hours'),
    notes: zod_1.z.string().max(1000).optional(),
});
/**
 * Schema for updating a flight booking
 */
exports.updateFlightSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    status: zod_1.z.enum(['SCHEDULED', 'AT_RISK', 'CANCELLED', 'RESCHEDULED', 'COMPLETED']).optional(),
    cancellationProbability: zod_1.z.number().int().min(0).max(100).optional(),
    riskLevel: zod_1.z.enum(['LOW', 'MODERATE', 'HIGH', 'EXTREME']).optional(),
});
/**
 * Schema for flight list query options
 */
exports.flightListOptionsSchema = zod_1.z.object({
    status: zod_1.z.enum(['SCHEDULED', 'AT_RISK', 'CANCELLED', 'RESCHEDULED', 'COMPLETED']).optional(),
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    offset: zod_1.z.number().int().min(0).default(0),
});
