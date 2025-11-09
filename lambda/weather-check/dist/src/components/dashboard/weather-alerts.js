"use strict";
/**
 * @fileoverview Weather alerts widget component
 * @module components/dashboard/weather-alerts
 */
'use client';
/**
 * @fileoverview Weather alerts widget component
 * @module components/dashboard/weather-alerts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherAlerts = WeatherAlerts;
const trpc_1 = require("@/lib/trpc");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const loading_spinner_1 = require("@/components/common/loading-spinner");
const empty_state_1 = require("@/components/common/empty-state");
const link_1 = __importDefault(require("next/link"));
const date_fns_1 = require("date-fns");
const lucide_react_1 = require("lucide-react");
/**
 * Weather alerts widget component
 * Lists all AT_RISK flights sorted by cancellation probability
 *
 * @returns Rendered weather alerts widget
 */
function WeatherAlerts() {
    const { data: flights, isLoading } = trpc_1.trpc.flights.list.useQuery({
        status: 'AT_RISK',
        limit: 10,
    }, {
        staleTime: 30 * 1000, // 30 seconds - weather status can change frequently
        refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    });
    if (isLoading) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Weather Alerts</card_1.CardTitle>
          <card_1.CardDescription>Active weather conflicts</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <loading_spinner_1.LoadingSpinner />
        </card_1.CardContent>
      </card_1.Card>);
    }
    const atRiskFlights = flights
        ?.sort((a, b) => {
        const probA = a.cancellationProbability || 0;
        const probB = b.cancellationProbability || 0;
        return probB - probA; // Highest probability first
    })
        .slice(0, 5) || [];
    const formatLocation = (location) => {
        if (!location)
            return 'Unknown';
        if (typeof location === 'object' && 'name' in location) {
            return location.name || `${location.latitude}, ${location.longitude}`;
        }
        return 'Unknown';
    };
    const getRiskColor = (riskLevel) => {
        if (riskLevel === 'EXTREME' || riskLevel === 'HIGH')
            return 'destructive';
        return 'warning';
    };
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Weather Alerts</card_1.CardTitle>
        <card_1.CardDescription>Flights with weather conflicts</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        {atRiskFlights.length === 0 ? (<empty_state_1.EmptyState title="Clear for Takeoff" description="No weather conflicts detected for your flights."/>) : (<div className="space-y-3">
            {atRiskFlights.map((flight) => {
                const departureLocation = flight.departureLocation;
                const hoursUntilFlight = (0, date_fns_1.differenceInHours)(new Date(flight.scheduledDate), new Date());
                const isUrgent = hoursUntilFlight < 24 && hoursUntilFlight >= 0;
                return (<link_1.default key={flight.id} href={`/dashboard/flights/${flight.id}`}>
                  <div className={`p-3 rounded-lg border-2 transition-colors ${flight.riskLevel === 'EXTREME' || flight.riskLevel === 'HIGH'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950'
                        : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'} ${isUrgent ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {(0, date_fns_1.format)(new Date(flight.scheduledDate), 'MMM dd, h:mm a')}
                          </p>
                          {isUrgent && (<badge_1.Badge variant="destructive" className="text-xs">
                              <lucide_react_1.AlertTriangle className="h-3 w-3 mr-1"/>
                              Urgent
                            </badge_1.Badge>)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatLocation(departureLocation)}
                        </p>
                      </div>
                      <badge_1.Badge variant={getRiskColor(flight.riskLevel)}>
                        {flight.cancellationProbability}%
                      </badge_1.Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <badge_1.Badge variant="outline" className="text-xs">
                        {flight.riskLevel || 'MODERATE'}
                      </badge_1.Badge>
                      <span className="text-muted-foreground">
                        {flight.trainingLevel}
                      </span>
                      {isUrgent && (<span className="text-orange-600 font-medium">
                          {hoursUntilFlight}h until flight
                        </span>)}
                    </div>
                  </div>
                </link_1.default>);
            })}
            {flights && flights.length > 5 && (<div className="pt-2">
                <link_1.default href="/dashboard/flights?status=AT_RISK">
                  <button className="text-sm text-primary hover:underline w-full text-left">
                    View all alerts →
                  </button>
                </link_1.default>
              </div>)}
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
