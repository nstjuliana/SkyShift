/**
 * @fileoverview Flight detail page
 * @module app/(dashboard)/dashboard/flights/[id]/page
 */

'use client';

import React from 'react';
import { trpc } from '@/lib/trpc';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { FlightStatusBadge } from '@/components/flights/flight-status-badge';
import { format } from 'date-fns';
import type { Location } from '@/types/flight';
import { ArrowLeft, MapPin, Calendar, Clock, User, AlertTriangle, Cloud, Wind, Eye, Thermometer, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { toPreferredUnit, formatTemperature } from '@/lib/temperature';

/**
 * Flight detail page component
 * 
 * @returns Rendered flight detail page
 */
export default function FlightDetailPage() {
  const params = useParams();
  const router = useRouter();
  const flightId = params.id as string;
  const { data: session } = useSession();
  const temperatureUnit = session?.user?.temperatureUnit || 'FAHRENHEIT';

  const { data: flight, isLoading, error, refetch } = trpc.flights.getById.useQuery(
    { id: flightId },
    { enabled: !!flightId }
  );

  const { data: weatherLog, refetch: refetchWeather, isLoading: isLoadingWeather } = trpc.weather.getFlightWeather.useQuery(
    { bookingId: flightId },
    { enabled: !!flightId }
  );

  const [freshWeatherData, setFreshWeatherData] = React.useState<{ data: any; source: any } | null>(null);

  const checkWeather = trpc.weather.checkFlight.useMutation({
    onSuccess: (data) => {
      console.log('[Flight Details] Weather check success:', {
        hasWeather: !!data.weather,
        source: data.source,
        fullData: data,
      });
      // Use weather data directly from the response
      if (data.weather) {
        setFreshWeatherData({
          data: data.weather,
          source: data.source,
        });
      }
      // Refetch both flight and weather data after a short delay to ensure DB is updated
      setTimeout(() => {
        refetch(); // Refetch flight data
        refetchWeather(); // Refetch weather data
      }, 500);
    },
    onError: (error) => {
      console.error('[Flight Details] Weather check error:', error);
      setFreshWeatherData(null);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Flight Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {error?.message || 'The flight you are looking for does not exist.'}
              </p>
              <Link href="/dashboard/flights">
                <Button>Back to Flights</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const departureLocation = flight.departureLocation as Location;
  const destinationLocation = flight.destinationLocation as Location | undefined;
  
  // Get weather data from latest weather log or from flight's weatherLogs
  const latestWeatherLog = weatherLog || (flight.weatherLogs && flight.weatherLogs[0]) || null;
  
  // Parse weatherData - it's stored as JSON in the database
  // Use fresh weather data from mutation if available, otherwise use from log
  let weatherData: any = freshWeatherData?.data || null;
  let weatherSource = freshWeatherData?.source || latestWeatherLog?.weatherSource;
  
  if (!weatherData && latestWeatherLog?.weatherData) {
    // If it's already an object, use it; if it's a string, parse it
    try {
      weatherData = typeof latestWeatherLog.weatherData === 'string' 
        ? JSON.parse(latestWeatherLog.weatherData)
        : latestWeatherLog.weatherData;
      console.log('[Flight Details] Parsed weather data:', weatherData);
    } catch (e) {
      console.error('Error parsing weather data:', e);
    }
  } else if (!weatherData) {
    console.log('No weather log found. Latest weather log:', latestWeatherLog);
  }
  
  const conflictDetails = latestWeatherLog?.conflictDetails 
    ? (typeof latestWeatherLog.conflictDetails === 'string'
        ? JSON.parse(latestWeatherLog.conflictDetails)
        : latestWeatherLog.conflictDetails)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/flights">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Flight Details</h1>
          <p className="text-muted-foreground mt-2">
            View detailed information about your flight booking
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Flight Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <FlightStatusBadge
                status={flight.status}
                cancellationProbability={flight.cancellationProbability}
                riskLevel={flight.riskLevel}
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Scheduled Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(flight.scheduledDate), 'EEEE, MMMM dd, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(flight.scheduledDate), 'h:mm a')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">{flight.duration} hours</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Training Level</p>
                <p className="text-sm text-muted-foreground">{flight.trainingLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium">Departure</p>
                <p className="text-sm text-muted-foreground">{departureLocation.name}</p>
                {departureLocation.icaoCode && (
                  <p className="text-xs text-muted-foreground">{departureLocation.icaoCode}</p>
                )}
              </div>
            </div>
            {destinationLocation && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Destination</p>
                  <p className="text-sm text-muted-foreground">{destinationLocation.name}</p>
                  {destinationLocation.icaoCode && (
                    <p className="text-xs text-muted-foreground">{destinationLocation.icaoCode}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Student</p>
            <p className="text-sm text-muted-foreground">
              {flight.student.name || flight.student.email}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Instructor</p>
            <p className="text-sm text-muted-foreground">
              {flight.instructor.name || flight.instructor.email}
            </p>
          </div>
        </CardContent>
      </Card>

      {flight.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{flight.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Weather Conditions</CardTitle>
              <CardDescription>
                Weather forecast for departure location
                {weatherSource && (
                  <span className="ml-2">
                    (Source: {weatherSource === 'TOMORROW_IO' ? 'Tomorrow.io' : 'OpenWeather'})
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => checkWeather.mutate({ bookingId: flightId })}
              disabled={checkWeather.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checkWeather.isPending ? 'animate-spin' : ''}`} />
              Refresh Weather
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {checkWeather.isPending && (
            <div className="text-center py-4">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground mt-2">Checking weather...</p>
            </div>
          )}
          {checkWeather.isError && (
            <div className="text-center py-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive">Error checking weather</p>
              <p className="text-xs text-muted-foreground mt-1">
                {checkWeather.error?.message || 'Failed to fetch weather data'}
              </p>
            </div>
          )}
          {!checkWeather.isPending && !weatherData && !checkWeather.isError && (
            <div className="text-center py-4">
              <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No weather data available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click &quot;Refresh Weather&quot; to check current conditions
              </p>
            </div>
          )}
          {weatherData && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Thermometer className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Temperature</p>
                    <p className="text-sm text-muted-foreground">
                      {weatherData.temperature !== undefined && weatherData.temperature !== null
                        ? formatTemperature(
                            toPreferredUnit(weatherData.temperature, temperatureUnit),
                            temperatureUnit
                          )
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wind className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Wind Speed</p>
                    <p className="text-sm text-muted-foreground">
                      {weatherData.windSpeed?.toFixed(1) || 'N/A'} knots
                      {weatherData.windDirection !== undefined && (
                        <span className="ml-1">
                          ({weatherData.windDirection}°)
                        </span>
                      )}
                    </p>
                    {weatherData.windGusts && (
                      <p className="text-xs text-muted-foreground">
                        Gusts: {weatherData.windGusts.toFixed(1)} knots
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Visibility</p>
                    <p className="text-sm text-muted-foreground">
                      {weatherData.visibility?.toFixed(1) || 'N/A'} miles
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Cloud className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Cloud Cover</p>
                    <p className="text-sm text-muted-foreground">
                      {weatherData.cloudCover?.toFixed(0) || 'N/A'}%
                    </p>
                    {weatherData.ceiling && (
                      <p className="text-xs text-muted-foreground">
                        Ceiling: {weatherData.ceiling.toFixed(0)} ft AGL
                      </p>
                    )}
                  </div>
                </div>
                {weatherData.precipitationType && (
                  <div className="flex items-center gap-3">
                    <Cloud className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Precipitation</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {String(weatherData.precipitationType).replace(/\d+$/, '').trim()}
                        {weatherData.precipitationIntensity !== undefined && 
                         weatherData.precipitationIntensity !== null && 
                         weatherData.precipitationIntensity > 0 && (
                          <span className="ml-1">
                            ({weatherData.precipitationIntensity.toFixed(1)} mm/h)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Conditions</p>
                <p className="text-sm text-muted-foreground">{weatherData.conditions || weatherData.description || 'N/A'}</p>
              </div>

              {conflictDetails && (conflictDetails.violations?.length > 0 || conflictDetails.reasons?.length > 0) && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-600">Weather Concerns</p>
                  </div>
                  {conflictDetails.violations && conflictDetails.violations.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Minimums Violations:</p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        {conflictDetails.violations.map((violation: string, idx: number) => (
                          <li key={idx}>{violation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {conflictDetails.reasons && conflictDetails.reasons.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Risk Factors:</p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        {conflictDetails.reasons.map((reason: string, idx: number) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {latestWeatherLog?.checkedAt && (
                <div className="pt-2 text-xs text-muted-foreground">
                  Last checked: {format(new Date(latestWeatherLog.checkedAt), 'MMM dd, yyyy h:mm a')}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

