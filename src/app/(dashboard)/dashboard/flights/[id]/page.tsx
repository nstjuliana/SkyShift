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
import { RescheduleOptions } from '@/components/flights/reschedule-options';
import { RescheduleConfirmationDialog } from '@/components/flights/reschedule-confirmation-dialog';
import { RescheduleApproval } from '@/components/flights/reschedule-approval';
import { format } from 'date-fns';
import type { Location } from '@/types/flight';
import type { RescheduleOption } from '@/types/reschedule';
import { ArrowLeft, MapPin, Calendar, Clock, User, AlertTriangle, Cloud, Wind, Eye, Thermometer, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toPreferredUnit, formatTemperature } from '@/lib/temperature';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const { toast } = useToast();

  // Determine user role early (needed for conditional queries)
  const isStudent = session?.user?.role === 'STUDENT';
  const isInstructor = session?.user?.role === 'INSTRUCTOR' || session?.user?.role === 'ADMIN';

  const [rescheduleOptions, setRescheduleOptions] = React.useState<RescheduleOption[] | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<RescheduleOption | null>(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);

  const { data: flight, isLoading, error, refetch } = trpc.flights.getById.useQuery(
    { id: flightId },
    { enabled: !!flightId }
  );

  const { data: weatherLog, refetch: refetchWeather, isLoading: isLoadingWeather } = trpc.weather.getFlightWeather.useQuery(
    { bookingId: flightId },
    { enabled: !!flightId }
  );

  // Check for existing reschedule
  const { data: existingReschedule } = trpc.reschedule.getById.useQuery(
    { rescheduleId: '' },
    { enabled: false } // We'll query differently
  );

  const generateOptions = trpc.reschedule.generateOptions.useMutation({
    onSuccess: (data) => {
      setRescheduleOptions(data.options);
      toast({
        title: 'Options Generated',
        description: 'AI has generated 3 reschedule options for you.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate reschedule options',
        variant: 'destructive',
      });
    },
  });

  const acceptOption = trpc.reschedule.acceptOption.useMutation({
    onSuccess: () => {
      toast({
        title: 'Reschedule Requested',
        description: 'Your instructor will be notified to approve the reschedule.',
      });
      setShowConfirmationDialog(false);
      setSelectedOption(null);
      setRescheduleOptions(null);
      refetch();
      // Refetch pending reschedule for instructors
      if (isInstructor) {
        refetchPendingReschedule();
      }
    },
    onError: (error) => {
      toast({
        title: 'Request Failed',
        description: error.message || 'Failed to submit reschedule request',
        variant: 'destructive',
      });
    },
  });

  const respondToReschedule = trpc.reschedule.respondToReschedule.useMutation({
    onSuccess: (data) => {
      toast({
        title: data.approved ? 'Reschedule Approved' : 'Reschedule Rejected',
        description: data.approved
          ? 'The flight has been rescheduled successfully.'
          : 'The reschedule request has been rejected.',
      });
      setPendingReschedule(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Action Failed',
        description: error.message || 'Failed to process reschedule response',
        variant: 'destructive',
      });
    },
  });

  // Fetch pending reschedule for this flight (if instructor)
  const { data: pendingRescheduleData, refetch: refetchPendingReschedule } = trpc.reschedule.listPending.useQuery(
    undefined,
    {
      enabled: isInstructor,
      select: (data) => {
        // Find reschedule for this specific flight
        return data.find((r) => r.booking?.id === flightId) || null;
      },
    }
  );

  const [pendingReschedule, setPendingReschedule] = React.useState(pendingRescheduleData);
  
  React.useEffect(() => {
    setPendingReschedule(pendingRescheduleData);
  }, [pendingRescheduleData]);

  // Refetch pending reschedule when acceptOption succeeds
  React.useEffect(() => {
    if (acceptOption.isSuccess && isInstructor) {
      refetchPendingReschedule();
    }
  }, [acceptOption.isSuccess, isInstructor, refetchPendingReschedule]);

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

  // Initialize runway heading state (must be before early returns)
  const [runwayHeading, setRunwayHeading] = React.useState<number | undefined>(undefined);
  
  // Get departure location ICAO code for airport query (safe to access even if flight is undefined)
  const departureIcaoCode = flight?.departureLocation ? (flight.departureLocation as Location).icaoCode : undefined;
  const storedRunwayHeading = flight?.departureLocation ? (flight.departureLocation as Location).runwayHeading : undefined;
  
  // Query to fetch airport data if runway heading is missing (must be before early returns)
  const { data: airportData } = trpc.airports.getByICAO.useQuery(
    { icaoCode: departureIcaoCode || '' },
    {
      enabled: !storedRunwayHeading && !runwayHeading && !!departureIcaoCode && !!flight,
      staleTime: Infinity, // Cache forever since runway heading doesn't change
    }
  );
  
  // Update runway heading when flight data or airport data is available (must be before early returns)
  React.useEffect(() => {
    if (storedRunwayHeading && !runwayHeading) {
      setRunwayHeading(storedRunwayHeading);
    } else if (airportData?.runwayHeading && !runwayHeading && !storedRunwayHeading) {
      setRunwayHeading(airportData.runwayHeading);
      console.log('[Flight Details] Fetched runway heading:', airportData.runwayHeading, 'for', departureIcaoCode);
    }
  }, [airportData, runwayHeading, storedRunwayHeading, departureIcaoCode]);

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
  
  // Use stored runway heading if available, otherwise use state
  const effectiveRunwayHeading = storedRunwayHeading || runwayHeading;
  
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

  // Calculate crosswind, headwind, and tailwind components
  const calculateCrosswind = (windSpeed: number, windDirection: number, runwayHeading?: number): { crosswind: number; headwind: number; tailwind: number; crosswindCalculation: string; headwindCalculation: string } | null => {
    if (!windSpeed || windDirection === undefined) {
      return null;
    }

    if (runwayHeading !== undefined) {
      // Calculate angle difference in degrees, normalize to 0-180
      let angleDiff = Math.abs(windDirection - runwayHeading);
      // Normalize to 0-180 degrees (wind from either side)
      if (angleDiff > 180) {
        angleDiff = 360 - angleDiff;
      }
      // Convert to radians and calculate wind components
      const angleDiffRad = angleDiff * (Math.PI / 180);
      const crosswind = Math.abs(windSpeed * Math.sin(angleDiffRad));
      const headwind = windSpeed * Math.cos(angleDiffRad); // Positive = headwind, negative = tailwind
      const tailwind = headwind < 0 ? -headwind : 0;
      
      const crosswindCalculation = `Crosswind = ${windSpeed.toFixed(1)} kt × sin(|${windDirection}° - ${runwayHeading}°|)\n= ${windSpeed.toFixed(1)} × sin(${angleDiff.toFixed(1)}°)\n= ${windSpeed.toFixed(1)} × ${Math.sin(angleDiffRad).toFixed(3)}\n= ${crosswind.toFixed(1)} kt`;
      
      const headwindCalculation = `Headwind = ${windSpeed.toFixed(1)} kt × cos(${angleDiff.toFixed(1)}°)\n= ${windSpeed.toFixed(1)} × ${Math.cos(angleDiffRad).toFixed(3)}\n= ${headwind > 0 ? headwind.toFixed(1) : 0} kt`;
      
      return { crosswind, headwind: headwind > 0 ? headwind : 0, tailwind, crosswindCalculation, headwindCalculation };
    } else {
      // Conservative worst-case estimate
      const crosswindCalculation = `Runway heading not available.\nUsing worst-case estimate:\nCrosswind = ${windSpeed.toFixed(1)} kt (assumes 90° angle)`;
      const headwindCalculation = `Runway heading not available.\nCannot calculate headwind.`;
      return { crosswind: windSpeed, headwind: 0, tailwind: windSpeed, crosswindCalculation, headwindCalculation };
    }
  };

  const crosswindData = weatherData && weatherData.windSpeed !== undefined && weatherData.windDirection !== undefined
    ? calculateCrosswind(weatherData.windSpeed, weatherData.windDirection, effectiveRunwayHeading)
    : null;

  const isAtRisk = flight.status === 'AT_RISK';

  const handleSelectOption = (option: RescheduleOption) => {
    setSelectedOption(option);
    setShowConfirmationDialog(true);
  };

  const handleApproveReschedule = (rescheduleId: string) => {
    respondToReschedule.mutate({
      rescheduleId,
      approved: true,
    });
  };

  const handleRejectReschedule = (rescheduleId: string, reason: string) => {
    respondToReschedule.mutate({
      rescheduleId,
      approved: false,
      rejectionReason: reason,
    });
  };

  const handleConfirmReschedule = () => {
    if (!selectedOption) return;
    acceptOption.mutate({
      bookingId: flightId,
      optionIndex: selectedOption.index,
    });
  };

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

      <Card>
        <CardHeader>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {departureLocation.name}
                {departureLocation.icaoCode && (
                  <span className="text-base font-normal text-muted-foreground">
                    ({departureLocation.icaoCode})
                  </span>
                )}
              </CardTitle>
              <FlightStatusBadge
                status={flight.status}
                cancellationProbability={flight.cancellationProbability}
                riskLevel={flight.riskLevel}
              />
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(flight.scheduledDate), 'EEEE, MMMM dd, yyyy')} at {format(new Date(flight.scheduledDate), 'h:mm a')}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Flight Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Flight Information</h3>
              <div className="space-y-4">
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
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Locations</h3>
              <div className="space-y-4">
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
              </div>
            </div>

            {/* People */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">People</h3>
              <div className="space-y-4">
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
              </div>
            </div>
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
                  <div className="flex-1">
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
                    {crosswindData && (
                      <div className="space-y-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                                Crosswind: {crosswindData.crosswind.toFixed(1)} kt
                              </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="whitespace-pre-line text-xs">
                                <p className="font-semibold mb-1">Crosswind Calculation:</p>
                                {crosswindData.crosswindCalculation}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {crosswindData.headwind > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                                  Headwind: {crosswindData.headwind.toFixed(1)} kt
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="whitespace-pre-line text-xs">
                                  <p className="font-semibold mb-1">Headwind Calculation:</p>
                                  {crosswindData.headwindCalculation}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {crosswindData.tailwind > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Tailwind: {crosswindData.tailwind.toFixed(1)} kt
                          </p>
                        )}
                      </div>
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

      {/* Pending Reschedule Approval (for Instructors) */}
      {isInstructor && pendingReschedule && pendingReschedule.status === 'PENDING_INSTRUCTOR' && (
        <RescheduleApproval
          reschedule={{
            id: pendingReschedule.id,
            proposedDate: new Date(pendingReschedule.proposedDate),
            proposedDuration: pendingReschedule.proposedDuration,
            aiReasoning: pendingReschedule.aiReasoning,
            weatherForecast: pendingReschedule.weatherForecast as any,
            studentConfirmedAt: pendingReschedule.studentConfirmedAt ? new Date(pendingReschedule.studentConfirmedAt) : null,
            createdAt: new Date(pendingReschedule.createdAt),
            booking: {
              id: pendingReschedule.booking!.id,
              scheduledDate: new Date(pendingReschedule.booking!.scheduledDate),
              duration: pendingReschedule.booking!.duration,
              student: {
                name: pendingReschedule.booking!.student.name,
                email: pendingReschedule.booking!.student.email,
              },
            },
          }}
          onApprove={handleApproveReschedule}
          onReject={handleRejectReschedule}
          isLoading={respondToReschedule.isPending}
        />
      )}

      {/* Weather Conflict Alert & Reschedule Section */}
      {isAtRisk && (
        <Card className="border-yellow-500 border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-600">Weather Conflict Detected</CardTitle>
            </div>
            <CardDescription>
              This flight has been flagged due to weather conditions. Consider rescheduling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!rescheduleOptions && isStudent && (
              <Button
                onClick={() => generateOptions.mutate({ bookingId: flightId })}
                disabled={generateOptions.isPending}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generateOptions.isPending ? 'Generating Options...' : 'Generate AI Reschedule Options'}
              </Button>
            )}
            {rescheduleOptions && isStudent && (
              <RescheduleOptions
                options={rescheduleOptions}
                isLoading={generateOptions.isPending}
                error={generateOptions.error?.message || null}
                onSelectOption={handleSelectOption}
                isProcessing={acceptOption.isPending}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Reschedule Confirmation Dialog */}
      {selectedOption && (
        <RescheduleConfirmationDialog
          open={showConfirmationDialog}
          onClose={() => {
            setShowConfirmationDialog(false);
            setSelectedOption(null);
          }}
          originalDate={new Date(flight.scheduledDate)}
          selectedOption={selectedOption}
          onConfirm={handleConfirmReschedule}
          isLoading={acceptOption.isPending}
        />
      )}

    </div>
  );
}

