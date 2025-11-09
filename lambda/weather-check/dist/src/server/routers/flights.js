"use strict";
/**
 * @fileoverview tRPC router for flight booking operations
 * @module server/routers/flights
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightsRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const flight_service_1 = require("@/services/flight-service");
const flight_schemas_1 = require("../schemas/flight-schemas");
/**
 * Flight management router
 * Handles all flight booking CRUD operations
 */
exports.flightsRouter = (0, trpc_1.router)({
    /**
     * List all flights for the authenticated user
     *
     * @returns Array of flight bookings
     */
    list: trpc_1.protectedProcedure
        .input(flight_schemas_1.flightListOptionsSchema.optional())
        .query(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        const userRole = ctx.session.user.role;
        return flight_service_1.flightService.listFlights(userId, userRole, input);
    }),
    /**
     * Get a single flight by ID
     *
     * @throws TRPCError if flight not found or unauthorized
     */
    getById: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string().cuid(),
    }))
        .query(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        const userRole = ctx.session.user.role;
        return flight_service_1.flightService.getFlightById(input.id, userId, userRole);
    }),
    /**
     * Create a new flight booking
     *
     * @returns Created flight with generated ID
     */
    create: trpc_1.protectedProcedure
        .input(flight_schemas_1.createFlightSchema)
        .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        return flight_service_1.flightService.createFlight(userId, input);
    }),
    /**
     * Update flight status and cancellation probability
     *
     * @returns Updated flight
     */
    updateStatus: trpc_1.protectedProcedure
        .input(flight_schemas_1.updateFlightSchema)
        .mutation(async ({ ctx, input }) => {
        return flight_service_1.flightService.updateFlightStatus(input);
    }),
});
