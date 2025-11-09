/**
 * @fileoverview Dashboard header component with user menu and logout
 * @module components/dashboard/dashboard-header
 */

'use client';

import { signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Props for DashboardHeader component
 */
interface DashboardHeaderProps {
  /** Current user session data */
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

/**
 * Dashboard header component
 * 
 * Displays logo, user info, and logout button
 * 
 * @param props - Component props
 * @returns Rendered dashboard header
 */
export function DashboardHeader({ user }: DashboardHeaderProps) {
  /**
   * Handle logout action
   */
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="border-b bg-card">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">SkyShift</h1>
          <span className="text-sm text-muted-foreground">
            Weather Cancellation & AI Rescheduling
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role.toLowerCase()}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

