"use strict";
/**
 * @fileoverview tRPC router for weather operations
 * @module server/routers/weather
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const weather_service_1 = require("@/services/weather-service");
/**
 * Weather management router
 * Handles weather checking and retrieval
 */
exports.weatherRouter = (0, trpc_1.router)({
    /**
     * Check weather for a specific flight
     *
     * @returns Weather check result with updated booking
     */
    checkFlight: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        bookingId: zod_1.z.string().cuid(),
    }))
        .mutation(async ({ ctx, input }) => {
        return weather_service_1.weatherService.checkFlightWeather(input.bookingId);
    }),
    /**
     * Check weather for all upcoming flights
     *
     * @returns Summary of checks performed
     */
    checkAllFlights: trpc_1.protectedProcedure.mutation(async ({ ctx }) => {
        return weather_service_1.weatherService.checkUpcomingFlights();
    }),
    /**
     * Get latest weather data for a flight
     *
     * @returns Latest weather log entry
     */
    getFlightWeather: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        bookingId: zod_1.z.string().cuid(),
    }))
        .query(async ({ ctx, input }) => {
        const weatherLog = await ctx.db.weatherLog.findFirst({
            where: { bookingId: input.bookingId },
            orderBy: { checkedAt: 'desc' },
        });
        return weatherLog;
    }),
});
