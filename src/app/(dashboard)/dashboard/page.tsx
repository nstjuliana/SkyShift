/**
 * @fileoverview Dashboard home page
 * @module app/(dashboard)/dashboard/page
 */

import { getServerSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { UpcomingFlights } from '@/components/dashboard/upcoming-flights';
import { WeatherAlerts } from '@/components/dashboard/weather-alerts';
import { DashboardWeatherActions } from '@/components/dashboard/dashboard-weather-actions';

/**
 * Dashboard home page component
 *
 * Displays welcome message, stats, upcoming flights, and weather alerts
 *
 * @returns Rendered dashboard home page
 */
export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session.user.name || 'User'}!</h1>
          <p className="text-muted-foreground mt-2">
            Manage your flight bookings and monitor weather conditions
          </p>
        </div>
        <DashboardWeatherActions />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingFlights />
        <WeatherAlerts />
      </div>
    </div>
  );
}
