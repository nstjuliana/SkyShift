/**
 * @fileoverview Dashboard home page
 * @module app/(dashboard)/dashboard/page
 */

import { getServerSession } from '@/lib/auth-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTRPC } from '@/components/test-trpc';

/**
 * Dashboard home page component
 *
 * Displays welcome message and overview
 *
 * @returns Rendered dashboard home page
 */
export default async function DashboardPage() {
  const session = await getServerSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name || 'User'}!</h1>
        <p className="text-muted-foreground mt-2">
          Manage your flight bookings and monitor weather conditions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Flights</CardTitle>
            <CardDescription>Your scheduled flight lessons</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">No flights scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weather Alerts</CardTitle>
            <CardDescription>Active weather conflicts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">All clear</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reschedules</CardTitle>
            <CardDescription>Pending reschedule requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">No pending requests</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <TestTRPC />
        </CardContent>
      </Card>
    </div>
  );
}

