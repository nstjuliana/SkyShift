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
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

