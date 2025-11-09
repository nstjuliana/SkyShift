"use strict";
/**
 * @fileoverview tRPC client setup with React Query integration
 * @module lib/trpc
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.trpcClient = exports.trpc = void 0;
exports.getBaseUrl = getBaseUrl;
const react_query_1 = require("@trpc/react-query");
const client_1 = require("@trpc/client");
/**
 * tRPC React hooks
 */
exports.trpc = (0, react_query_1.createTRPCReact)();
/**
 * Get tRPC client for server-side usage
 *
 * @returns tRPC client instance
 */
function getBaseUrl() {
    if (typeof window !== 'undefined') {
        return '';
    }
    // AWS Amplify
    if (process.env.AWS_AMPLIFY_URL) {
        return `https://${process.env.AWS_AMPLIFY_URL}`;
    }
    // Vercel
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    // Use NEXTAUTH_URL if available (production)
    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL;
    }
    // Development fallback
    return `http://localhost:${process.env.PORT ?? 3000}`;
}
/**
 * Create tRPC client configuration
 */
exports.trpcClient = exports.trpc.createClient({
    links: [
        (0, client_1.httpBatchLink)({
            url: `${getBaseUrl()}/api/trpc`,
        }),
    ],
});
