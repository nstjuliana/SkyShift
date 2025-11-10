/**
 * @fileoverview Flight booking type definitions
 * @module types/flight
 */

import type { Booking, FlightStatus, TrainingLevel, RiskLevel } from '@prisma/client';

/**
 * Location with coordinates
 */
export interface Location {
  /** Location name (e.g., "KJFK - John F. Kennedy International") */
  name: string;
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** ICAO airport code (if applicable) */
  icaoCode?: string;
  /** Primary runway heading in degrees (0-360). Used for crosswind calculations. */
  runwayHeading?: number;
}

/**
 * Flight booking with related data
 */
export interface Flight extends Booking {
  student: {
    id: string;
    name: string | null;
    email: string;
    trainingLevel: TrainingLevel | null;
  };
  instructor: {
    id: string;
    name: string | null;
    email: string;
  };
}

/**
 * Serialized Flight type for client-side use
 * Dates are serialized as strings when coming from tRPC/API
 * Defined as a standalone interface to avoid deep type inference issues
 */
export interface SerializedFlight {
  id: string;
  studentId: string;
  instructorId: string;
  scheduledDate: string | Date;
  status: FlightStatus;
  trainingLevel: TrainingLevel;
  duration: number;
  departureLocation: unknown; // JSON type from Prisma
  destinationLocation: unknown | null; // JSON type from Prisma
  cancellationProbability: number | null;
  riskLevel: RiskLevel | null;
  notes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  student: {
    id: string;
    name: string | null;
    email: string;
    trainingLevel: TrainingLevel | null;
  };
  instructor: {
    id: string;
    name: string | null;
    email: string;
  };
}

/**
 * Input for creating a new flight booking
 * Note: studentId is not included - it comes from the authenticated session
 */
export interface CreateFlightInput {
  /** Instructor user ID */
  instructorId: string;
  /** Scheduled date and time */
  scheduledDate: Date;
  /** Training level for this flight */
  trainingLevel: TrainingLevel;
  /** Departure location */
  departureLocation: Location;
  /** Destination location (if cross-country) */
  destinationLocation?: Location;
  /** Duration in hours */
  duration: number;
  /** Optional notes */
  notes?: string;
}

/**
 * Input for updating a flight booking
 */
export interface UpdateFlightInput {
  /** Flight ID to update */
  id: string;
  /** Optional status update */
  status?: FlightStatus;
  /** Optional cancellation probability (0-100) */
  cancellationProbability?: number;
  /** Optional risk level */
  riskLevel?: RiskLevel;
}

/**
 * Flight list query options
 */
export interface FlightListOptions {
  /** Filter by status */
  status?: FlightStatus;
  /** Filter by date range start */
  startDate?: Date;
  /** Filter by date range end */
  endDate?: Date;
  /** Number of results to return */
  limit?: number;
  /** Number of results to skip */
  offset?: number;
}

/**
 * Type guard to check if a string is a valid FlightStatus
 */
export function isFlightStatus(value: string): value is FlightStatus {
  return ['SCHEDULED', 'AT_RISK', 'CANCELLED', 'RESCHEDULED', 'COMPLETED'].includes(value);
}

/**
 * Type guard to check if a string is a valid TrainingLevel
 */
export function isTrainingLevel(value: string): value is TrainingLevel {
  return ['STUDENT', 'PRIVATE', 'INSTRUMENT', 'COMMERCIAL'].includes(value);
}

