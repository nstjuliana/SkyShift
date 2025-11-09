"use strict";
/**
 * @fileoverview tRPC router for airport operations
 * @module server/routers/airports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.airportsRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const airportdb_1 = require("@/lib/airportdb");
/**
 * Airport management router
 * Handles airport search operations
 */
exports.airportsRouter = (0, trpc_1.router)({
    /**
     * Search airports by query string
     *
     * @returns Array of matching airports
     */
    search: trpc_1.publicProcedure
        .input(zod_1.z.object({
        query: zod_1.z.string().min(2, 'Query must be at least 2 characters'),
        limit: zod_1.z.number().int().min(1).max(50).default(20).optional(),
    }))
        .query(async ({ ctx, input }) => {
        return airportdb_1.airportDBClient.searchAirports(input.query, input.limit);
    }),
    /**
     * Get airport by ICAO code
     *
     * @returns Airport location or null
     */
    getByICAO: trpc_1.publicProcedure
        .input(zod_1.z.object({
        icaoCode: zod_1.z.string().length(4, 'ICAO code must be 4 characters'),
    }))
        .query(async ({ ctx, input }) => {
        return airportdb_1.airportDBClient.getAirportByICAO(input.icaoCode);
    }),
});
