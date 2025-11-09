/**
 * @fileoverview Test component to verify tRPC connection
 * @module components/test-trpc
 */

'use client';

import { trpc } from '@/lib/trpc';

/**
 * Test component to verify tRPC health check
 * 
 * @returns Rendered test component
 */
export function TestTRPC() {
  const { data, isLoading, error } = trpc.health.useQuery();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Testing tRPC...</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        tRPC Error: {error.message}
      </div>
    );
  }

  return (
    <div className="text-sm text-green-600">
      ✅ tRPC Connected! Status: {data?.status} at {data?.timestamp}
    </div>
  );
}

