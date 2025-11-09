/**
 * @fileoverview Analytics dashboard page
 * @module app/(dashboard)/dashboard/analytics/page
 */

'use client';

import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { format } from 'date-fns';

/**
 * Analytics dashboard page component
 * 
 * @returns Rendered analytics page
 */
export default function AnalyticsPage() {
  const { data: flights, isLoading } = trpc.flights.list.useQuery({
    limit: 1000, // Get all flights for analytics
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner />
      </div>
    );
  }

  const now = new Date();
  const totalFlights = flights?.length || 0;
  const upcomingFlights = flights?.filter(
    (f) => new Date(f.scheduledDate) >= now
  ).length || 0;
  const completedFlights = flights?.filter(
    (f) => f.status === 'COMPLETED'
  ).length || 0;
  const cancelledFlights = flights?.filter(
    (f) => f.status === 'CANCELLED'
  ).length || 0;
  const atRiskFlights = flights?.filter(
    (f) => f.status === 'AT_RISK'
  ).length || 0;

  // Calculate total flight hours
  const totalHours = flights?.reduce((sum, f) => sum + f.duration, 0) || 0;

  // Group by training level
  const flightsByLevel = flights?.reduce((acc, f) => {
    acc[f.trainingLevel] = (acc[f.trainingLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          View insights and statistics about your flights
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Flights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalFlights}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcomingFlights}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completedFlights}</p>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{cancelledFlights}</p>
            <p className="text-xs text-muted-foreground">Cancelled flights</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Flight Statistics</CardTitle>
            <CardDescription>Overview of your flight activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Flight Hours</span>
              <span className="text-sm font-medium">{totalHours.toFixed(1)}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">At-Risk Flights</span>
              <span className="text-sm font-medium text-yellow-600">{atRiskFlights}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className="text-sm font-medium">
                {totalFlights > 0
                  ? ((completedFlights / totalFlights) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Level Distribution</CardTitle>
            <CardDescription>Flights by training level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(flightsByLevel).map(([level, count]) => (
              <div key={level} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{level}</span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
            {Object.keys(flightsByLevel).length === 0 && (
              <p className="text-sm text-muted-foreground">No flights yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

