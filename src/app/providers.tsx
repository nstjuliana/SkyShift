/**
 * @fileoverview React providers for tRPC, React Query, and NextAuth
 * @module app/providers
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { trpc, trpcClient } from '@/lib/trpc';

/**
 * Providers component wrapping tRPC, React Query, and NextAuth
 * 
 * @param children - Child components
 * @returns Providers wrapper
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: true,
            refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
          },
        },
      })
  );

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}

