"use strict";
/**
 * @fileoverview Flight card component displaying flight booking summary
 * @module components/flights/flight-card
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightCard = FlightCard;
const link_1 = __importDefault(require("next/link"));
const card_1 = require("@/components/ui/card");
const flight_status_badge_1 = require("./flight-status-badge");
const date_fns_1 = require("date-fns");
/**
 * Formats location for display
 */
function formatLocation(location) {
    if (!location)
        return 'Unknown';
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
function FlightCard({ flight, className }) {
    const departureLocation = flight.departureLocation;
    const destinationLocation = flight.destinationLocation;
    return (<link_1.default href={`/dashboard/flights/${flight.id}`}>
      <card_1.Card className={`p-4 hover:shadow-md transition-shadow ${className || ''}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">
              {(0, date_fns_1.format)(new Date(flight.scheduledDate), 'MMM dd, yyyy h:mm a')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatLocation(departureLocation)}
              {destinationLocation && ` → ${formatLocation(destinationLocation)}`}
            </p>
          </div>
          <flight_status_badge_1.FlightStatusBadge status={flight.status} cancellationProbability={flight.cancellationProbability} riskLevel={flight.riskLevel}/>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Duration: {flight.duration}h</span>
          <span>Level: {flight.trainingLevel}</span>
          {flight.cancellationProbability !== null && flight.cancellationProbability !== undefined && (<span className="text-warning">
              Risk: {flight.cancellationProbability}%
            </span>)}
        </div>
      </card_1.Card>
    </link_1.default>);
}
