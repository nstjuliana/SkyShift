"use strict";
/**
 * @fileoverview Test component to verify tRPC connection
 * @module components/test-trpc
 */
'use client';
/**
 * @fileoverview Test component to verify tRPC connection
 * @module components/test-trpc
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestTRPC = TestTRPC;
const trpc_1 = require("@/lib/trpc");
/**
 * Test component to verify tRPC health check
 *
 * @returns Rendered test component
 */
function TestTRPC() {
    const { data, isLoading, error } = trpc_1.trpc.health.useQuery();
    if (isLoading) {
        return <div className="text-sm text-muted-foreground">Testing tRPC...</div>;
    }
    if (error) {
        return (<div className="text-sm text-destructive">
        tRPC Error: {error.message}
      </div>);
    }
    return (<div className="text-sm text-green-600">
      ✅ tRPC Connected! Status: {data?.status} at {data?.timestamp}
    </div>);
}
