"use strict";
/**
 * @fileoverview Flight booking type definitions
 * @module types/flight
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFlightStatus = isFlightStatus;
exports.isTrainingLevel = isTrainingLevel;
/**
 * Type guard to check if a string is a valid FlightStatus
 */
function isFlightStatus(value) {
    return ['SCHEDULED', 'AT_RISK', 'CANCELLED', 'RESCHEDULED', 'COMPLETED'].includes(value);
}
/**
 * Type guard to check if a string is a valid TrainingLevel
 */
function isTrainingLevel(value) {
    return ['STUDENT', 'PRIVATE', 'INSTRUMENT', 'COMMERCIAL'].includes(value);
}
