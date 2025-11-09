"use strict";
/**
 * @fileoverview Server-side auth helper for NextAuth v5
 * @module lib/auth-server
 *
 * Re-exports auth function for server-side usage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerSession = void 0;
const route_1 = require("@/app/api/auth/[...nextauth]/route");
/**
 * Server-side auth function
 * Use this in Server Components and API routes
 */
exports.getServerSession = route_1.auth;
