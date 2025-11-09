"use strict";
/**
 * @fileoverview Error boundary for dashboard routes
 * @module app/(dashboard)/error
 */
'use client';
/**
 * @fileoverview Error boundary for dashboard routes
 * @module app/(dashboard)/error
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardError;
const react_1 = require("react");
const error_message_1 = require("@/components/common/error-message");
const button_1 = require("@/components/ui/button");
/**
 * Dashboard error component
 *
 * Displays error message with retry option
 *
 * @param props - Component props
 * @returns Rendered error state
 */
function DashboardError({ error, reset }) {
    (0, react_1.useEffect)(() => {
        console.error('Dashboard error:', error);
    }, [error]);
    return (<div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full">
        <error_message_1.ErrorMessage title="Something went wrong" message={error.message || 'An unexpected error occurred'} onRetry={reset}/>
        <div className="mt-4 text-center">
          <button_1.Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Return to Dashboard
          </button_1.Button>
        </div>
      </div>
    </div>);
}
