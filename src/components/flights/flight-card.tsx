/**
 * @fileoverview Flight card component displaying flight booking summary
 * @module components/flights/flight-card
 */

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { FlightStatusBadge } from './flight-status-badge';
import { format } from 'date-fns';
import type { SerializedFlight } from '@/types/flight';
import type { Location } from '@/types/flight';

/**
 * Props for FlightCard component
 */
interface FlightCardProps {
  /** Flight data to display */
  flight: SerializedFlight;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Formats location for display
 */
function formatLocation(location: Location | null | undefined): string {
  if (!location) return 'Unknown';
  if (typeof location === 'object' && 'name' in location) {
    return location.name || `${location.latitude}, ${location.longitude}`;
  }
  return 'Unknown';
}

/**
 * Displays a flight booking in a card format with key details
 * 
 * @param props - Component props
 * @returns Rendered flight card
 */
export function FlightCard({ flight, className }: FlightCardProps) {
  const departureLocation = flight.departureLocation as Location;
  const destinationLocation = flight.destinationLocation as Location | undefined;

  return (
      <Link href={`/dashboard/flights/${flight.id}`}>
      <Card className={`p-4 hover:shadow-md transition-shadow ${className || ''}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">
              {format(new Date(flight.scheduledDate), 'MMM dd, yyyy h:mm a')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatLocation(departureLocation)}
              {destinationLocation && ` → ${formatLocation(destinationLocation)}`}
            </p>
          </div>
          <FlightStatusBadge
            status={flight.status}
            cancellationProbability={flight.cancellationProbability}
            riskLevel={flight.riskLevel}
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Duration: {flight.duration}h</span>
          <span>Level: {flight.trainingLevel}</span>
          {flight.cancellationProbability !== null && flight.cancellationProbability !== undefined && (
            <span className="text-warning">
              Risk: {flight.cancellationProbability}%
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}

