/**
 * @fileoverview Flights list page
 * @module app/(dashboard)/dashboard/flights/page
 */

'use client';

import { trpc } from '@/lib/trpc';
import { FlightCard } from '@/components/flights/flight-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import Link from 'next/link';
import { useState } from 'react';
import type { FlightStatus } from '@prisma/client';

/**
 * Flights list page component
 * 
 * @returns Rendered flights list page
 */
export default function FlightsPage() {
  const [statusFilter, setStatusFilter] = useState<FlightStatus | 'ALL'>('ALL');

  const { data: flights, isLoading, error } = trpc.flights.list.useQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Flights</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your flight bookings
          </p>
        </div>
        <Link href="/dashboard/flights/new">
          <Button>Schedule New Flight</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Flight Bookings</CardTitle>
              <CardDescription>All your scheduled flights</CardDescription>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as FlightStatus | 'ALL')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="AT_RISK">At Risk</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <LoadingSpinner />}
          {error && (
            <div className="text-destructive">
              Error loading flights: {error.message}
            </div>
          )}
          {!isLoading && !error && flights && flights.length === 0 && (
            <EmptyState
              title="No flights found"
              description="You don't have any flights scheduled yet."
              action={
                <Link href="/dashboard/flights/new">
                  <Button>Schedule Your First Flight</Button>
                </Link>
              }
            />
          )}
          {!isLoading && !error && flights && flights.length > 0 && (
            <div className="space-y-4">
              {flights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

