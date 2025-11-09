"use strict";
/**
 * @fileoverview React providers for tRPC, React Query, and NextAuth
 * @module app/providers
 */
'use client';
/**
 * @fileoverview React providers for tRPC, React Query, and NextAuth
 * @module app/providers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Providers = Providers;
const react_query_1 = require("@tanstack/react-query");
const react_1 = require("react");
const react_2 = require("next-auth/react");
const trpc_1 = require("@/lib/trpc");
/**
 * Providers component wrapping tRPC, React Query, and NextAuth
 *
 * @param children - Child components
 * @returns Providers wrapper
 */
function Providers({ children }) {
    const [queryClient] = (0, react_1.useState)(() => new react_query_1.QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30 * 1000, // 30 seconds default (for flight lists)
                gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
                refetchOnWindowFocus: true,
                retry: 1, // Retry failed requests once
            },
        },
    }));
    return (<react_2.SessionProvider>
      <trpc_1.trpc.Provider client={trpc_1.trpcClient} queryClient={queryClient}>
        <react_query_1.QueryClientProvider client={queryClient}>{children}</react_query_1.QueryClientProvider>
      </trpc_1.trpc.Provider>
    </react_2.SessionProvider>);
}
