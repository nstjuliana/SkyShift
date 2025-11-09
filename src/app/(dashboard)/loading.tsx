/**
 * @fileoverview Loading state for dashboard routes
 * @module app/(dashboard)/loading
 */

import { LoadingSpinner } from '@/components/common/loading-spinner';

/**
 * Dashboard loading component
 * 
 * Displays loading spinner while dashboard data loads
 * 
 * @returns Rendered loading state
 */
export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text="Loading dashboard..." />
    </div>
  );
}

