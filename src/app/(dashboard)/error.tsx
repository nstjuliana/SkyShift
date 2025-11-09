/**
 * @fileoverview Error boundary for dashboard routes
 * @module app/(dashboard)/error
 */

'use client';

import { useEffect } from 'react';
import { ErrorMessage } from '@/components/common/error-message';
import { Button } from '@/components/ui/button';

/**
 * Props for DashboardError component
 */
interface DashboardErrorProps {
  /** Error object */
  error: Error & { digest?: string };
  /** Reset function */
  reset: () => void;
}

/**
 * Dashboard error component
 * 
 * Displays error message with retry option
 * 
 * @param props - Component props
 * @returns Rendered error state
 */
export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full">
        <ErrorMessage
          title="Something went wrong"
          message={error.message || 'An unexpected error occurred'}
          onRetry={reset}
        />
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

