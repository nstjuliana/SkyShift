"use strict";
/**
 * @fileoverview Dashboard layout with authentication check
 * @module app/(dashboard)/layout
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardLayout;
const navigation_1 = require("next/navigation");
const auth_server_1 = require("@/lib/auth-server");
const dashboard_header_1 = require("@/components/dashboard/dashboard-header");
const dashboard_nav_1 = require("@/components/dashboard/dashboard-nav");
/**
 * Dashboard layout component
 *
 * Protects dashboard routes and provides navigation
 *
 * @param children - Child components to render
 * @returns Dashboard layout with header and navigation
 */
async function DashboardLayout({ children, }) {
    const session = await (0, auth_server_1.getServerSession)();
    if (!session) {
        (0, navigation_1.redirect)('/login');
    }
    return (<div className="min-h-screen bg-background">
      <dashboard_header_1.DashboardHeader user={session.user}/>
      <div className="flex">
        <dashboard_nav_1.DashboardNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>);
}
