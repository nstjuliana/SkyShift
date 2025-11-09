/**
 * @fileoverview Flight status badge component
 * @module components/flights/flight-status-badge
 */

import { Badge } from '@/components/ui/badge';
import type { FlightStatus, RiskLevel } from '@prisma/client';

/**
 * Props for FlightStatusBadge component
 */
interface FlightStatusBadgeProps {
  /** Flight status */
  status: FlightStatus;
  /** Cancellation probability (0-100) */
  cancellationProbability?: number | null;
  /** Risk level */
  riskLevel?: RiskLevel | null;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Color mapping for flight statuses
 */
const statusColors: Record<FlightStatus, 'default' | 'success' | 'warning' | 'destructive'> = {
  SCHEDULED: 'success',
  AT_RISK: 'warning',
  CANCELLED: 'destructive',
  RESCHEDULED: 'default',
  COMPLETED: 'default',
};

/**
 * Displays a flight status badge with color coding
 * 
 * @param props - Component props
 * @returns Rendered status badge
 */
export function FlightStatusBadge({
  status,
  cancellationProbability,
  riskLevel,
  className,
}: FlightStatusBadgeProps) {
  const variant = statusColors[status];
  const displayText = status === 'AT_RISK' && cancellationProbability !== null && cancellationProbability !== undefined
    ? `${status.replace('_', ' ')} (${cancellationProbability}%)`
    : status.replace('_', ' ');

  return (
    <Badge variant={variant} className={className}>
      {displayText}
    </Badge>
  );
}

