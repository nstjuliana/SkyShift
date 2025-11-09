"use strict";
/**
 * @fileoverview Dashboard stat cards component
 * @module components/dashboard/stat-cards
 */
'use client';
/**
 * @fileoverview Dashboard stat cards component
 * @module components/dashboard/stat-cards
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatCards = StatCards;
const trpc_1 = require("@/lib/trpc");
const card_1 = require("@/components/ui/card");
const loading_spinner_1 = require("@/components/common/loading-spinner");
/**
 * Dashboard stat cards component
 * Displays key flight statistics
 *
 * @returns Rendered stat cards
 */
function StatCards() {
    const { data: flights, isLoading } = trpc_1.trpc.flights.list.useQuery({
        limit: 100, // Get all flights for stats
    });
    if (isLoading) {
        return (<div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (<card_1.Card key={i}>
            <card_1.CardHeader>
              <card_1.CardTitle>Loading...</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <loading_spinner_1.LoadingSpinner />
            </card_1.CardContent>
          </card_1.Card>))}
      </div>);
    }
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingFlights = flights?.filter((flight) => new Date(flight.scheduledDate) >= now &&
        new Date(flight.scheduledDate) <= sevenDaysFromNow) || [];
    const atRiskFlights = upcomingFlights.filter((flight) => flight.status === 'AT_RISK');
    const highRiskFlights = atRiskFlights.filter((flight) => flight.cancellationProbability && flight.cancellationProbability > 60);
    return (<div className="grid gap-4 md:grid-cols-3">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Upcoming Flights</card_1.CardTitle>
          <card_1.CardDescription>Next 7 days</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <p className="text-2xl font-bold">{upcomingFlights.length}</p>
          <p className="text-xs text-muted-foreground">Scheduled flights</p>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>At-Risk Flights</card_1.CardTitle>
          <card_1.CardDescription>Weather conflicts detected</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <p className="text-2xl font-bold text-yellow-600">{atRiskFlights.length}</p>
          <p className="text-xs text-muted-foreground">Require attention</p>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>High-Risk Flights</card_1.CardTitle>
          <card_1.CardDescription>High cancellation probability</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <p className="text-2xl font-bold text-red-600">{highRiskFlights.length}</p>
          <p className="text-xs text-muted-foreground">Probability &gt; 60%</p>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
