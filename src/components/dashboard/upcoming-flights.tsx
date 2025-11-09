/**
 * @fileoverview Upcoming flights widget component
 * @module components/dashboard/upcoming-flights
 */

'use client';

import { trpc } from '@/lib/trpc';
import { FlightCard } from '@/components/flights/flight-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Upcoming flights widget component
 * Displays next 5 flights chronologically
 * 
 * @returns Rendered upcoming flights widget
 */
export function UpcomingFlights() {
  const { data: flights, isLoading } = trpc.flights.list.useQuery(
    {
      limit: 5,
    },
    {
      staleTime: 30 * 1000, // 30 seconds - flight lists update frequently
    }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Flights</CardTitle>
          <CardDescription>Your next scheduled flights</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  const now = new Date();
  const upcoming = flights
    ?.filter((flight) => new Date(flight.scheduledDate) >= now)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Flights</CardTitle>
        <CardDescription>Your next scheduled flights</CardDescription>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming flights"
            description="You don't have any flights scheduled."
            action={
              <Link href="/dashboard/flights/new">
                <Button size="sm">Schedule Flight</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
            {flights && flights.length > 5 && (
              <div className="pt-2">
                <Link href="/dashboard/flights">
                  <Button variant="outline" className="w-full">
                    View All Flights
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

