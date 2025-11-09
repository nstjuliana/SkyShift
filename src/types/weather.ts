/**
 * @fileoverview Weather data type definitions
 * @module types/weather
 */

import type { RiskLevel, WeatherSource } from '@prisma/client';

/**
 * Unified weather data format from both OpenWeather and Tomorrow.io
 */
export interface WeatherData {
  /** Temperature in Fahrenheit */
  temperature: number;
  /** Wind speed in knots */
  windSpeed: number;
  /** Wind direction in degrees (0-360) */
  windDirection: number;
  /** Wind gusts in knots (if available) */
  windGusts?: number;
  /** Visibility in statute miles */
  visibility: number;
  /** Cloud cover percentage (0-100) */
  cloudCover: number;
  /** Ceiling in feet AGL (if available) */
  ceiling?: number;
  /** Precipitation type (rain, snow, etc.) */
  precipitationType?: string;
  /** Precipitation intensity (if available) */
  precipitationIntensity?: number;
  /** Weather conditions description */
  conditions: string;
  /** Detailed description */
  description: string;
  /** Timestamp of weather data */
  timestamp: Date;
}

/**
 * Weather condition assessment
 */
export interface WeatherCondition {
  /** Weather data */
  weather: WeatherData;
  /** Source of weather data */
  source: WeatherSource;
  /** Whether conditions are safe for flight */
  isSafe: boolean;
  /** List of minimums violations */
  violations: string[];
  /** Severity score (0-100) */
  severityScore: number;
}

/**
 * Cancellation risk assessment
 */
export interface CancellationRisk {
  /** Cancellation probability (0-100) */
  probability: number;
  /** Risk level */
  riskLevel: RiskLevel;
  /** Reasons for risk */
  reasons: string[];
  /** Weather condition details */
  condition: WeatherCondition;
}

/**
 * Weather API response wrapper
 */
export interface WeatherResponse {
  /** Weather data */
  data: WeatherData;
  /** Source API */
  source: WeatherSource;
  /** Timestamp when data was fetched */
  fetchedAt: Date;
}

