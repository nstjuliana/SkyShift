/**
 * @fileoverview Weather alerts widget component
 * @module components/dashboard/weather-alerts
 */

'use client';

import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import Link from 'next/link';
import { format, differenceInHours } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import type { Location, SerializedFlight } from '@/types/flight';

/**
 * Weather alerts widget component
 * Lists all AT_RISK flights sorted by cancellation probability
 * 
 * @returns Rendered weather alerts widget
 */
export function WeatherAlerts() {
  const { data: flights, isLoading } = trpc.flights.list.useQuery(
    {
      status: 'AT_RISK',
      limit: 10,
    },
    {
      staleTime: 30 * 1000, // 30 seconds - weather status can change frequently
      refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    }
  ) as { data: SerializedFlight[] | undefined; isLoading: boolean };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather Alerts</CardTitle>
          <CardDescription>Active weather conflicts</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  const atRiskFlights = flights
    ?.sort((a, b) => {
      const probA = a.cancellationProbability || 0;
      const probB = b.cancellationProbability || 0;
      return probB - probA; // Highest probability first
    })
    .slice(0, 5) || [];

  const formatLocation = (location: Location | null | undefined): string => {
    if (!location) return 'Unknown';
    if (typeof location === 'object' && 'name' in location) {
      return location.name || `${location.latitude}, ${location.longitude}`;
    }
    return 'Unknown';
  };

  const getRiskColor = (riskLevel: string | null | undefined): 'destructive' | 'warning' => {
    if (riskLevel === 'EXTREME' || riskLevel === 'HIGH') return 'destructive';
    return 'warning';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather Alerts</CardTitle>
        <CardDescription>Flights with weather conflicts</CardDescription>
      </CardHeader>
      <CardContent>
        {atRiskFlights.length === 0 ? (
          <EmptyState
            title="Clear for Takeoff"
            description="No weather conflicts detected for your flights."
          />
        ) : (
          <div className="space-y-3">
            {atRiskFlights.map((flight) => {
              const departureLocation = flight.departureLocation as Location;
              const hoursUntilFlight = differenceInHours(new Date(flight.scheduledDate), new Date());
              const isUrgent = hoursUntilFlight < 24 && hoursUntilFlight >= 0;
              
              return (
                <Link key={flight.id} href={`/dashboard/flights/${flight.id}`}>
                  <div
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      flight.riskLevel === 'EXTREME' || flight.riskLevel === 'HIGH'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950'
                        : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                    } ${isUrgent ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {format(new Date(flight.scheduledDate), 'MMM dd, h:mm a')}
                          </p>
                          {isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatLocation(departureLocation)}
                        </p>
                      </div>
                      <Badge variant={getRiskColor(flight.riskLevel)}>
                        {flight.cancellationProbability}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs">
                        {flight.riskLevel || 'MODERATE'}
                      </Badge>
                      <span className="text-muted-foreground">
                        {flight.trainingLevel}
                      </span>
                      {isUrgent && (
                        <span className="text-orange-600 font-medium">
                          {hoursUntilFlight}h until flight
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
            {flights && flights.length > 5 && (
              <div className="pt-2">
                <Link href="/dashboard/flights?status=AT_RISK">
                  <button className="text-sm text-primary hover:underline w-full text-left">
                    View all alerts →
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

