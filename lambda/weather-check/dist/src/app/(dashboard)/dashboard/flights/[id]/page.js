"use strict";
/**
 * @fileoverview Flight detail page
 * @module app/(dashboard)/dashboard/flights/[id]/page
 */
'use client';
/**
 * @fileoverview Flight detail page
 * @module app/(dashboard)/dashboard/flights/[id]/page
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FlightDetailPage;
const react_1 = __importDefault(require("react"));
const trpc_1 = require("@/lib/trpc");
const navigation_1 = require("next/navigation");
const react_2 = require("next-auth/react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const loading_spinner_1 = require("@/components/common/loading-spinner");
const flight_status_badge_1 = require("@/components/flights/flight-status-badge");
const reschedule_options_1 = require("@/components/flights/reschedule-options");
const reschedule_confirmation_dialog_1 = require("@/components/flights/reschedule-confirmation-dialog");
const reschedule_approval_1 = require("@/components/flights/reschedule-approval");
const date_fns_1 = require("date-fns");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const temperature_1 = require("@/lib/temperature");
const use_toast_1 = require("@/hooks/use-toast");
const tooltip_1 = require("@/components/ui/tooltip");
/**
 * Flight detail page component
 *
 * @returns Rendered flight detail page
 */
function FlightDetailPage() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const flightId = params.id;
    const { data: session } = (0, react_2.useSession)();
    const temperatureUnit = session?.user?.temperatureUnit || 'FAHRENHEIT';
    const { toast } = (0, use_toast_1.useToast)();
    // Determine user role early (needed for conditional queries)
    const isStudent = session?.user?.role === 'STUDENT';
    const isInstructor = session?.user?.role === 'INSTRUCTOR' || session?.user?.role === 'ADMIN';
    const [rescheduleOptions, setRescheduleOptions] = react_1.default.useState(null);
    const [selectedOption, setSelectedOption] = react_1.default.useState(null);
    const [showConfirmationDialog, setShowConfirmationDialog] = react_1.default.useState(false);
    const { data: flight, isLoading, error, refetch } = trpc_1.trpc.flights.getById.useQuery({ id: flightId }, { enabled: !!flightId });
    const { data: weatherLog, refetch: refetchWeather, isLoading: isLoadingWeather } = trpc_1.trpc.weather.getFlightWeather.useQuery({ bookingId: flightId }, { enabled: !!flightId });
    // Check for existing reschedule
    const { data: existingReschedule } = trpc_1.trpc.reschedule.getById.useQuery({ rescheduleId: '' }, { enabled: false } // We'll query differently
    );
    const generateOptions = trpc_1.trpc.reschedule.generateOptions.useMutation({
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
    const acceptOption = trpc_1.trpc.reschedule.acceptOption.useMutation({
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
    const respondToReschedule = trpc_1.trpc.reschedule.respondToReschedule.useMutation({
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
    const { data: pendingRescheduleData, refetch: refetchPendingReschedule } = trpc_1.trpc.reschedule.listPending.useQuery(undefined, {
        enabled: isInstructor,
        select: (data) => {
            // Find reschedule for this specific flight
            return data.find((r) => r.booking?.id === flightId) || null;
        },
    });
    const [pendingReschedule, setPendingReschedule] = react_1.default.useState(pendingRescheduleData);
    react_1.default.useEffect(() => {
        setPendingReschedule(pendingRescheduleData);
    }, [pendingRescheduleData]);
    // Refetch pending reschedule when acceptOption succeeds
    react_1.default.useEffect(() => {
        if (acceptOption.isSuccess && isInstructor) {
            refetchPendingReschedule();
        }
    }, [acceptOption.isSuccess, isInstructor, refetchPendingReschedule]);
    const [freshWeatherData, setFreshWeatherData] = react_1.default.useState(null);
    const checkWeather = trpc_1.trpc.weather.checkFlight.useMutation({
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
    const [runwayHeading, setRunwayHeading] = react_1.default.useState(undefined);
    // Get departure location ICAO code for airport query (safe to access even if flight is undefined)
    const departureIcaoCode = flight?.departureLocation ? flight.departureLocation.icaoCode : undefined;
    const storedRunwayHeading = flight?.departureLocation ? flight.departureLocation.runwayHeading : undefined;
    // Query to fetch airport data if runway heading is missing (must be before early returns)
    const { data: airportData } = trpc_1.trpc.airports.getByICAO.useQuery({ icaoCode: departureIcaoCode || '' }, {
        enabled: !storedRunwayHeading && !runwayHeading && !!departureIcaoCode && !!flight,
        staleTime: Infinity, // Cache forever since runway heading doesn't change
    });
    // Update runway heading when flight data or airport data is available (must be before early returns)
    react_1.default.useEffect(() => {
        if (storedRunwayHeading && !runwayHeading) {
            setRunwayHeading(storedRunwayHeading);
        }
        else if (airportData?.runwayHeading && !runwayHeading && !storedRunwayHeading) {
            setRunwayHeading(airportData.runwayHeading);
            console.log('[Flight Details] Fetched runway heading:', airportData.runwayHeading, 'for', departureIcaoCode);
        }
    }, [airportData, runwayHeading, storedRunwayHeading, departureIcaoCode]);
    if (isLoading) {
        return (<div className="space-y-6">
        <loading_spinner_1.LoadingSpinner />
      </div>);
    }
    if (error || !flight) {
        return (<div className="space-y-6">
        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="text-center">
              <lucide_react_1.AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4"/>
              <h2 className="text-2xl font-bold mb-2">Flight Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {error?.message || 'The flight you are looking for does not exist.'}
              </p>
              <link_1.default href="/dashboard/flights">
                <button_1.Button>Back to Flights</button_1.Button>
              </link_1.default>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    const departureLocation = flight.departureLocation;
    const destinationLocation = flight.destinationLocation;
    // Use stored runway heading if available, otherwise use state
    const effectiveRunwayHeading = storedRunwayHeading || runwayHeading;
    // Get weather data from latest weather log or from flight's weatherLogs
    const latestWeatherLog = weatherLog || (flight.weatherLogs && flight.weatherLogs[0]) || null;
    // Parse weatherData - it's stored as JSON in the database
    // Use fresh weather data from mutation if available, otherwise use from log
    let weatherData = freshWeatherData?.data || null;
    let weatherSource = freshWeatherData?.source || latestWeatherLog?.weatherSource;
    if (!weatherData && latestWeatherLog?.weatherData) {
        // If it's already an object, use it; if it's a string, parse it
        try {
            weatherData = typeof latestWeatherLog.weatherData === 'string'
                ? JSON.parse(latestWeatherLog.weatherData)
                : latestWeatherLog.weatherData;
            console.log('[Flight Details] Parsed weather data:', weatherData);
        }
        catch (e) {
            console.error('Error parsing weather data:', e);
        }
    }
    else if (!weatherData) {
        console.log('No weather log found. Latest weather log:', latestWeatherLog);
    }
    const conflictDetails = latestWeatherLog?.conflictDetails
        ? (typeof latestWeatherLog.conflictDetails === 'string'
            ? JSON.parse(latestWeatherLog.conflictDetails)
            : latestWeatherLog.conflictDetails)
        : null;
    // Calculate crosswind, headwind, and tailwind components
    const calculateCrosswind = (windSpeed, windDirection, runwayHeading) => {
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
        }
        else {
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
    const handleSelectOption = (option) => {
        setSelectedOption(option);
        setShowConfirmationDialog(true);
    };
    const handleApproveReschedule = (rescheduleId) => {
        respondToReschedule.mutate({
            rescheduleId,
            approved: true,
        });
    };
    const handleRejectReschedule = (rescheduleId, reason) => {
        respondToReschedule.mutate({
            rescheduleId,
            approved: false,
            rejectionReason: reason,
        });
    };
    const handleConfirmReschedule = () => {
        if (!selectedOption)
            return;
        acceptOption.mutate({
            bookingId: flightId,
            optionIndex: selectedOption.index,
        });
    };
    return (<div className="space-y-6">
      <div className="flex items-center gap-4">
        <link_1.default href="/dashboard/flights">
          <button_1.Button variant="ghost" size="icon">
            <lucide_react_1.ArrowLeft className="h-4 w-4"/>
          </button_1.Button>
        </link_1.default>
        <div>
          <h1 className="text-3xl font-bold">Flight Details</h1>
          <p className="text-muted-foreground mt-2">
            View detailed information about your flight booking
          </p>
        </div>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.MapPin className="h-5 w-5"/>
                {departureLocation.name}
                {departureLocation.icaoCode && (<span className="text-base font-normal text-muted-foreground">
                    ({departureLocation.icaoCode})
                  </span>)}
              </card_1.CardTitle>
              <flight_status_badge_1.FlightStatusBadge status={flight.status} cancellationProbability={flight.cancellationProbability} riskLevel={flight.riskLevel}/>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <lucide_react_1.Clock className="h-4 w-4"/>
              <span>
                {(0, date_fns_1.format)(new Date(flight.scheduledDate), 'EEEE, MMMM dd, yyyy')} at {(0, date_fns_1.format)(new Date(flight.scheduledDate), 'h:mm a')}
              </span>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Flight Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Flight Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
                  <div>
                    <p className="text-sm font-medium">Scheduled Date</p>
                    <p className="text-sm text-muted-foreground">
                      {(0, date_fns_1.format)(new Date(flight.scheduledDate), 'EEEE, MMMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(0, date_fns_1.format)(new Date(flight.scheduledDate), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground"/>
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">{flight.duration} hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <lucide_react_1.User className="h-4 w-4 text-muted-foreground"/>
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
                  <lucide_react_1.MapPin className="h-4 w-4 text-muted-foreground mt-1"/>
                  <div>
                    <p className="text-sm font-medium">Departure</p>
                    <p className="text-sm text-muted-foreground">{departureLocation.name}</p>
                    {departureLocation.icaoCode && (<p className="text-xs text-muted-foreground">{departureLocation.icaoCode}</p>)}
                  </div>
                </div>
                {destinationLocation && (<div className="flex items-start gap-2">
                    <lucide_react_1.MapPin className="h-4 w-4 text-muted-foreground mt-1"/>
                    <div>
                      <p className="text-sm font-medium">Destination</p>
                      <p className="text-sm text-muted-foreground">{destinationLocation.name}</p>
                      {destinationLocation.icaoCode && (<p className="text-xs text-muted-foreground">{destinationLocation.icaoCode}</p>)}
                    </div>
                  </div>)}
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
        </card_1.CardContent>
      </card_1.Card>

      {flight.notes && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Notes</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{flight.notes}</p>
          </card_1.CardContent>
        </card_1.Card>)}

      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle>Weather Conditions</card_1.CardTitle>
              <card_1.CardDescription>
                Weather forecast for departure location
                {weatherSource && (<span className="ml-2">
                    (Source: {weatherSource === 'TOMORROW_IO' ? 'Tomorrow.io' : 'OpenWeather'})
                  </span>)}
              </card_1.CardDescription>
            </div>
            <button_1.Button variant="outline" size="sm" onClick={() => checkWeather.mutate({ bookingId: flightId })} disabled={checkWeather.isPending}>
              <lucide_react_1.RefreshCw className={`h-4 w-4 mr-2 ${checkWeather.isPending ? 'animate-spin' : ''}`}/>
              Refresh Weather
            </button_1.Button>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          {checkWeather.isPending && (<div className="text-center py-4">
              <loading_spinner_1.LoadingSpinner />
              <p className="text-sm text-muted-foreground mt-2">Checking weather...</p>
            </div>)}
          {checkWeather.isError && (<div className="text-center py-4">
              <lucide_react_1.AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2"/>
              <p className="text-sm text-destructive">Error checking weather</p>
              <p className="text-xs text-muted-foreground mt-1">
                {checkWeather.error?.message || 'Failed to fetch weather data'}
              </p>
            </div>)}
          {!checkWeather.isPending && !weatherData && !checkWeather.isError && (<div className="text-center py-4">
              <lucide_react_1.Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-2"/>
              <p className="text-sm text-muted-foreground">No weather data available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click &quot;Refresh Weather&quot; to check current conditions
              </p>
            </div>)}
          {weatherData && (<div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-3">
                  <lucide_react_1.Thermometer className="h-5 w-5 text-muted-foreground"/>
                  <div>
                    <p className="text-sm font-medium">Temperature</p>
                    <p className="text-sm text-muted-foreground">
                      {weatherData.temperature !== undefined && weatherData.temperature !== null
                ? (0, temperature_1.formatTemperature)((0, temperature_1.toPreferredUnit)(weatherData.temperature, temperatureUnit), temperatureUnit)
                : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <lucide_react_1.Wind className="h-5 w-5 text-muted-foreground"/>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Wind Speed</p>
                    <p className="text-sm text-muted-foreground">
                      {weatherData.windSpeed?.toFixed(1) || 'N/A'} knots
                      {weatherData.windDirection !== undefined && (<span className="ml-1">
                          ({weatherData.windDirection}°)
                        </span>)}
                    </p>
                    {weatherData.windGusts && (<p className="text-xs text-muted-foreground">
                        Gusts: {weatherData.windGusts.toFixed(1)} knots
                      </p>)}
                    {crosswindData && (<div className="space-y-1">
                        <tooltip_1.TooltipProvider>
                          <tooltip_1.Tooltip>
                            <tooltip_1.TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                                Crosswind: {crosswindData.crosswind.toFixed(1)} kt
                              </p>
                            </tooltip_1.TooltipTrigger>
                            <tooltip_1.TooltipContent className="max-w-xs">
                              <div className="whitespace-pre-line text-xs">
                                <p className="font-semibold mb-1">Crosswind Calculation:</p>
                                {crosswindData.crosswindCalculation}
                              </div>
                            </tooltip_1.TooltipContent>
                          </tooltip_1.Tooltip>
                        </tooltip_1.TooltipProvider>
                        {crosswindData.headwind > 0 && (<tooltip_1.TooltipProvider>
                            <tooltip_1.Tooltip>
                              <tooltip_1.TooltipTrigger asChild>
                                <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                                  Headwind: {crosswindData.headwind.toFixed(1)} kt
                                </p>
                              </tooltip_1.TooltipTrigger>
                              <tooltip_1.TooltipContent className="max-w-xs">
                                <div className="whitespace-pre-line text-xs">
                                  <p className="font-semibold mb-1">Headwind Calculation:</p>
                                  {crosswindData.headwindCalculation}
                                </div>
                              </tooltip_1.TooltipContent>
                            </tooltip_1.Tooltip>
                          </tooltip_1.TooltipProvider>)}
                        {crosswindData.tailwind > 0 && (<p className="text-xs text-muted-foreground">
                            Tailwind: {crosswindData.tailwind.toFixed(1)} kt
                          </p>)}
                      </div>)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <lucide_react_1.Eye className="h-5 w-5 text-muted-foreground"/>
                  <div>
                    <p className="text-sm font-medium">Visibility</p>
                    <p className="text-sm text-muted-foreground">
                      {weatherData.visibility?.toFixed(1) || 'N/A'} miles
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <lucide_react_1.Cloud className="h-5 w-5 text-muted-foreground"/>
                  <div>
                    <p className="text-sm font-medium">Cloud Cover</p>
                    <p className="text-sm text-muted-foreground">
                      {weatherData.cloudCover?.toFixed(0) || 'N/A'}%
                    </p>
                    {weatherData.ceiling && (<p className="text-xs text-muted-foreground">
                        Ceiling: {weatherData.ceiling.toFixed(0)} ft AGL
                      </p>)}
                  </div>
                </div>
                {weatherData.precipitationType && (<div className="flex items-center gap-3">
                    <lucide_react_1.Cloud className="h-5 w-5 text-muted-foreground"/>
                    <div>
                      <p className="text-sm font-medium">Precipitation</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {String(weatherData.precipitationType).replace(/\d+$/, '').trim()}
                        {weatherData.precipitationIntensity !== undefined &&
                    weatherData.precipitationIntensity !== null &&
                    weatherData.precipitationIntensity > 0 && (<span className="ml-1">
                            ({weatherData.precipitationIntensity.toFixed(1)} mm/h)
                          </span>)}
                      </p>
                    </div>
                  </div>)}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Conditions</p>
                <p className="text-sm text-muted-foreground">{weatherData.conditions || weatherData.description || 'N/A'}</p>
              </div>

              {conflictDetails && (conflictDetails.violations?.length > 0 || conflictDetails.reasons?.length > 0) && (<div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600"/>
                    <p className="text-sm font-medium text-yellow-600">Weather Concerns</p>
                  </div>
                  {conflictDetails.violations && conflictDetails.violations.length > 0 && (<div className="mb-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Minimums Violations:</p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        {conflictDetails.violations.map((violation, idx) => (<li key={idx}>{violation}</li>))}
                      </ul>
                    </div>)}
                  {conflictDetails.reasons && conflictDetails.reasons.length > 0 && (<div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Risk Factors:</p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        {conflictDetails.reasons.map((reason, idx) => (<li key={idx}>{reason}</li>))}
                      </ul>
                    </div>)}
                </div>)}

              {latestWeatherLog?.checkedAt && (<div className="pt-2 text-xs text-muted-foreground">
                  Last checked: {(0, date_fns_1.format)(new Date(latestWeatherLog.checkedAt), 'MMM dd, yyyy h:mm a')}
                </div>)}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Pending Reschedule Approval (for Instructors) */}
      {isInstructor && pendingReschedule && pendingReschedule.status === 'PENDING_INSTRUCTOR' && (<reschedule_approval_1.RescheduleApproval reschedule={{
                id: pendingReschedule.id,
                proposedDate: new Date(pendingReschedule.proposedDate),
                proposedDuration: pendingReschedule.proposedDuration,
                aiReasoning: pendingReschedule.aiReasoning,
                weatherForecast: pendingReschedule.weatherForecast,
                studentConfirmedAt: pendingReschedule.studentConfirmedAt ? new Date(pendingReschedule.studentConfirmedAt) : null,
                createdAt: new Date(pendingReschedule.createdAt),
                booking: {
                    id: pendingReschedule.booking.id,
                    scheduledDate: new Date(pendingReschedule.booking.scheduledDate),
                    duration: pendingReschedule.booking.duration,
                    student: {
                        name: pendingReschedule.booking.student.name,
                        email: pendingReschedule.booking.student.email,
                    },
                },
            }} onApprove={handleApproveReschedule} onReject={handleRejectReschedule} isLoading={respondToReschedule.isPending}/>)}

      {/* Weather Conflict Alert & Reschedule Section */}
      {isAtRisk && (<card_1.Card className="border-yellow-500 border-2">
          <card_1.CardHeader>
            <div className="flex items-center gap-2">
              <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-600"/>
              <card_1.CardTitle className="text-yellow-600">Weather Conflict Detected</card_1.CardTitle>
            </div>
            <card_1.CardDescription>
              This flight has been flagged due to weather conditions. Consider rescheduling.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {!rescheduleOptions && isStudent && (<button_1.Button onClick={() => generateOptions.mutate({ bookingId: flightId })} disabled={generateOptions.isPending} className="w-full">
                <lucide_react_1.Sparkles className="h-4 w-4 mr-2"/>
                {generateOptions.isPending ? 'Generating Options...' : 'Generate AI Reschedule Options'}
              </button_1.Button>)}
            {rescheduleOptions && isStudent && (<reschedule_options_1.RescheduleOptions options={rescheduleOptions} isLoading={generateOptions.isPending} error={generateOptions.error?.message || null} onSelectOption={handleSelectOption} isProcessing={acceptOption.isPending}/>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Reschedule Confirmation Dialog */}
      {selectedOption && (<reschedule_confirmation_dialog_1.RescheduleConfirmationDialog open={showConfirmationDialog} onClose={() => {
                setShowConfirmationDialog(false);
                setSelectedOption(null);
            }} originalDate={new Date(flight.scheduledDate)} selectedOption={selectedOption} onConfirm={handleConfirmReschedule} isLoading={acceptOption.isPending}/>)}

    </div>);
}
