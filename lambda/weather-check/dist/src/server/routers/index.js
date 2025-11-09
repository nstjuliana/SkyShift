"use strict";
/**
 * @fileoverview Root tRPC router
 * @module server/routers/index
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const trpc_1 = require("../trpc");
const flights_1 = require("./flights");
const weather_1 = require("./weather");
const airports_1 = require("./airports");
const users_1 = require("./users");
const reschedule_1 = require("./reschedule");
/**
 * Health check procedure
 */
const healthCheck = trpc_1.publicProcedure
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
exports.appRouter = (0, trpc_1.router)({
    health: healthCheck,
    flights: flights_1.flightsRouter,
    weather: weather_1.weatherRouter,
    airports: airports_1.airportsRouter,
    users: users_1.usersRouter,
    reschedule: reschedule_1.rescheduleRouter,
});
