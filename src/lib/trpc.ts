/**
 * @fileoverview tRPC client setup with React Query integration
 * @module lib/trpc
 */

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/routers';

/**
 * tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get tRPC client for server-side usage
 * 
 * @returns tRPC client instance
 */
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Create tRPC client configuration
 */
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

