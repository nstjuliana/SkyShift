"use strict";
/**
 * @fileoverview Dashboard header component with user menu and logout
 * @module components/dashboard/dashboard-header
 */
'use client';
/**
 * @fileoverview Dashboard header component with user menu and logout
 * @module components/dashboard/dashboard-header
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardHeader = DashboardHeader;
const react_1 = require("next-auth/react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
/**
 * Dashboard header component
 *
 * Displays logo, user info, and logout button
 *
 * @param props - Component props
 * @returns Rendered dashboard header
 */
function DashboardHeader({ user }) {
    /**
     * Handle logout action
     */
    const handleLogout = async () => {
        await (0, react_1.signOut)({ callbackUrl: '/login' });
    };
    return (<header className="border-b bg-card">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">SkyShift</h1>
          <span className="text-sm text-muted-foreground">
            Weather Cancellation & AI Rescheduling
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <lucide_react_1.User className="h-4 w-4 text-muted-foreground"/>
            <div className="text-sm">
              <p className="font-medium">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role.toLowerCase()}
              </p>
            </div>
          </div>
          <button_1.Button variant="ghost" size="sm" onClick={handleLogout}>
            <lucide_react_1.LogOut className="h-4 w-4 mr-2"/>
            Logout
          </button_1.Button>
        </div>
      </div>
    </header>);
}
