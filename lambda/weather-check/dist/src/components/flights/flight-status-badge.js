"use strict";
/**
 * @fileoverview Flight status badge component
 * @module components/flights/flight-status-badge
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightStatusBadge = FlightStatusBadge;
const badge_1 = require("@/components/ui/badge");
/**
 * Color mapping for flight statuses
 */
const statusColors = {
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
function FlightStatusBadge({ status, cancellationProbability, riskLevel, className, }) {
    const variant = statusColors[status];
    const displayText = status === 'AT_RISK' && cancellationProbability !== null && cancellationProbability !== undefined
        ? `${status.replace('_', ' ')} (${cancellationProbability}%)`
        : status.replace('_', ' ');
    return (<badge_1.Badge variant={variant} className={className}>
      {displayText}
    </badge_1.Badge>);
}
