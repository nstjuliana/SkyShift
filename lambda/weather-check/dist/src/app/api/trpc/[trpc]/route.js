"use strict";
/**
 * @fileoverview tRPC API route handler
 * @module app/api/trpc/[trpc]/route
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const fetch_1 = require("@trpc/server/adapters/fetch");
const routers_1 = require("@/server/routers");
const context_1 = require("@/server/context");
/**
 * tRPC request handler
 */
const handler = (req) => (0, fetch_1.fetchRequestHandler)({
    endpoint: '/api/trpc',
    req,
    router: routers_1.appRouter,
    createContext: context_1.createContext,
});
exports.GET = handler;
exports.POST = handler;
