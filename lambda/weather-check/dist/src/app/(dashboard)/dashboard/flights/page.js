"use strict";
/**
 * @fileoverview Flights list page
 * @module app/(dashboard)/dashboard/flights/page
 */
'use client';
/**
 * @fileoverview Flights list page
 * @module app/(dashboard)/dashboard/flights/page
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FlightsPage;
const trpc_1 = require("@/lib/trpc");
const flight_card_1 = require("@/components/flights/flight-card");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const select_1 = require("@/components/ui/select");
const loading_spinner_1 = require("@/components/common/loading-spinner");
const empty_state_1 = require("@/components/common/empty-state");
const link_1 = __importDefault(require("next/link"));
const react_1 = require("react");
/**
 * Flights list page component
 *
 * @returns Rendered flights list page
 */
function FlightsPage() {
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('ALL');
    const { data: flights, isLoading, error } = trpc_1.trpc.flights.list.useQuery({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
    });
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Flights</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your flight bookings
          </p>
        </div>
        <link_1.default href="/dashboard/flights/new">
          <button_1.Button>Schedule New Flight</button_1.Button>
        </link_1.default>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle>Flight Bookings</card_1.CardTitle>
              <card_1.CardDescription>All your scheduled flights</card_1.CardDescription>
            </div>
            <select_1.Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <select_1.SelectTrigger className="w-[180px]">
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="ALL">All Statuses</select_1.SelectItem>
                <select_1.SelectItem value="SCHEDULED">Scheduled</select_1.SelectItem>
                <select_1.SelectItem value="AT_RISK">At Risk</select_1.SelectItem>
                <select_1.SelectItem value="CANCELLED">Cancelled</select_1.SelectItem>
                <select_1.SelectItem value="RESCHEDULED">Rescheduled</select_1.SelectItem>
                <select_1.SelectItem value="COMPLETED">Completed</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          {isLoading && <loading_spinner_1.LoadingSpinner />}
          {error && (<div className="text-destructive">
              Error loading flights: {error.message}
            </div>)}
          {!isLoading && !error && flights && flights.length === 0 && (<empty_state_1.EmptyState title="No flights found" description="You don't have any flights scheduled yet." action={<link_1.default href="/dashboard/flights/new">
                  <button_1.Button>Schedule Your First Flight</button_1.Button>
                </link_1.default>}/>)}
          {!isLoading && !error && flights && flights.length > 0 && (<div className="space-y-4">
              {flights.map((flight) => (<flight_card_1.FlightCard key={flight.id} flight={flight}/>))}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
