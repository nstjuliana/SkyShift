/**
 * @fileoverview Dashboard stat cards component
 * @module components/dashboard/stat-cards
 */

'use client';

import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import type { SerializedFlight } from '@/types/flight';

/**
 * Dashboard stat cards component
 * Displays key flight statistics
 * 
 * @returns Rendered stat cards
 */
export function StatCards() {
  const { data: flights, isLoading } = trpc.flights.list.useQuery({
    limit: 100, // Get all flights for stats
  }) as { data: SerializedFlight[] | undefined; isLoading: boolean };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingSpinner />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingFlights = flights?.filter(
    (flight) =>
      new Date(flight.scheduledDate) >= now &&
      new Date(flight.scheduledDate) <= sevenDaysFromNow
  ) || [];

  const atRiskFlights = upcomingFlights.filter((flight) => flight.status === 'AT_RISK');
  const highRiskFlights = atRiskFlights.filter(
    (flight) => flight.cancellationProbability && flight.cancellationProbability > 60
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Flights</CardTitle>
          <CardDescription>Next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{upcomingFlights.length}</p>
          <p className="text-xs text-muted-foreground">Scheduled flights</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>At-Risk Flights</CardTitle>
          <CardDescription>Weather conflicts detected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-yellow-600">{atRiskFlights.length}</p>
          <p className="text-xs text-muted-foreground">Require attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>High-Risk Flights</CardTitle>
          <CardDescription>High cancellation probability</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{highRiskFlights.length}</p>
          <p className="text-xs text-muted-foreground">Probability &gt; 60%</p>
        </CardContent>
      </Card>
    </div>
  );
}

