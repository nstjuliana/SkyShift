"use strict";
/**
 * @fileoverview Loading state for dashboard routes
 * @module app/(dashboard)/loading
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardLoading;
const loading_spinner_1 = require("@/components/common/loading-spinner");
/**
 * Dashboard loading component
 *
 * Displays loading spinner while dashboard data loads
 *
 * @returns Rendered loading state
 */
function DashboardLoading() {
    return (<div className="flex items-center justify-center min-h-[400px]">
      <loading_spinner_1.LoadingSpinner size="lg" text="Loading dashboard..."/>
    </div>);
}
