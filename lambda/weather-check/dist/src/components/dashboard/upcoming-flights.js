"use strict";
/**
 * @fileoverview Upcoming flights widget component
 * @module components/dashboard/upcoming-flights
 */
'use client';
/**
 * @fileoverview Upcoming flights widget component
 * @module components/dashboard/upcoming-flights
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpcomingFlights = UpcomingFlights;
const trpc_1 = require("@/lib/trpc");
const flight_card_1 = require("@/components/flights/flight-card");
const card_1 = require("@/components/ui/card");
const loading_spinner_1 = require("@/components/common/loading-spinner");
const empty_state_1 = require("@/components/common/empty-state");
const link_1 = __importDefault(require("next/link"));
const button_1 = require("@/components/ui/button");
/**
 * Upcoming flights widget component
 * Displays next 5 flights chronologically
 *
 * @returns Rendered upcoming flights widget
 */
function UpcomingFlights() {
    const { data: flights, isLoading } = trpc_1.trpc.flights.list.useQuery({
        limit: 5,
    }, {
        staleTime: 30 * 1000, // 30 seconds - flight lists update frequently
    });
    if (isLoading) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Upcoming Flights</card_1.CardTitle>
          <card_1.CardDescription>Your next scheduled flights</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <loading_spinner_1.LoadingSpinner />
        </card_1.CardContent>
      </card_1.Card>);
    }
    const now = new Date();
    const upcoming = flights
        ?.filter((flight) => new Date(flight.scheduledDate) >= now)
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
        .slice(0, 5) || [];
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Upcoming Flights</card_1.CardTitle>
        <card_1.CardDescription>Your next scheduled flights</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        {upcoming.length === 0 ? (<empty_state_1.EmptyState title="No upcoming flights" description="You don't have any flights scheduled." action={<link_1.default href="/dashboard/flights/new">
                <button_1.Button size="sm">Schedule Flight</button_1.Button>
              </link_1.default>}/>) : (<div className="space-y-3">
            {upcoming.map((flight) => (<flight_card_1.FlightCard key={flight.id} flight={flight}/>))}
            {flights && flights.length > 5 && (<div className="pt-2">
                <link_1.default href="/dashboard/flights">
                  <button_1.Button variant="outline" className="w-full">
                    View All Flights
                  </button_1.Button>
                </link_1.default>
              </div>)}
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
