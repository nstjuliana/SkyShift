"use strict";
/**
 * @fileoverview Dashboard home page
 * @module app/(dashboard)/dashboard/page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
const auth_server_1 = require("@/lib/auth-server");
const navigation_1 = require("next/navigation");
const upcoming_flights_1 = require("@/components/dashboard/upcoming-flights");
const weather_alerts_1 = require("@/components/dashboard/weather-alerts");
const pending_reschedules_1 = require("@/components/dashboard/pending-reschedules");
const dashboard_weather_actions_1 = require("@/components/dashboard/dashboard-weather-actions");
const stat_cards_1 = require("@/components/dashboard/stat-cards");
/**
 * Dashboard home page component
 *
 * Displays welcome message, stats, upcoming flights, and weather alerts
 *
 * @returns Rendered dashboard home page
 */
async function DashboardPage() {
    const session = await (0, auth_server_1.getServerSession)();
    if (!session?.user) {
        (0, navigation_1.redirect)('/login');
    }
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session.user.name || 'User'}!</h1>
          <p className="text-muted-foreground mt-2">
            Manage your flight bookings and monitor weather conditions
          </p>
        </div>
        <dashboard_weather_actions_1.DashboardWeatherActions />
      </div>

      <stat_cards_1.StatCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <upcoming_flights_1.UpcomingFlights />
        <weather_alerts_1.WeatherAlerts />
        <pending_reschedules_1.PendingReschedules />
      </div>
    </div>);
}
