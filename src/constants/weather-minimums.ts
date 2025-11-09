/**
 * @fileoverview Weather minimums for different pilot training levels
 * @module constants/weather-minimums
 */

import type { TrainingLevel } from '@prisma/client';

/**
 * Weather minimums configuration for each training level
 */
export interface WeatherMinimums {
  /** Minimum visibility in statute miles */
  visibility: number;
  /** Minimum ceiling in feet AGL (Above Ground Level), null means no restriction */
  ceiling: number | null;
  /** Maximum wind speed in knots */
  maxWindSpeed: number;
  /** Maximum crosswind component in knots */
  maxCrosswind: number;
  /** Maximum tailwind component in knots */
  maxTailwind: number;
  /** Whether IMC (Instrument Meteorological Conditions) are acceptable */
  allowIMC: boolean;
}

/**
 * Weather minimums map by training level
 * Based on FAA regulations and flight school policies
 */
export const WEATHER_MINIMUMS: Record<TrainingLevel, WeatherMinimums> = {
  /**
   * Student Pilot Requirements:
   * - VFR only (Visual Flight Rules)
   * - Clear skies preferred
   * - Low wind speeds
   */
  STUDENT: {
    visibility: 5, // 5 statute miles minimum
    ceiling: 3000, // 3000 feet AGL minimum
    maxWindSpeed: 10, // 10 knots maximum
    maxCrosswind: 5, // 5 knots maximum crosswind
    maxTailwind: 3, // 3 knots maximum tailwind
    allowIMC: false, // No instrument conditions
  },

  /**
   * Private Pilot Requirements:
   * - VFR only
   * - Standard VFR minimums
   */
  PRIVATE: {
    visibility: 3, // 3 statute miles minimum
    ceiling: 1000, // 1000 feet AGL minimum
    maxWindSpeed: 20, // 20 knots maximum
    maxCrosswind: 12, // 12 knots maximum crosswind
    maxTailwind: 5, // 5 knots maximum tailwind
    allowIMC: false,
  },

  /**
   * Instrument Rated Pilot Requirements:
   * - Can fly in IMC (Instrument Meteorological Conditions)
   * - Must avoid severe weather
   */
  INSTRUMENT: {
    visibility: 0.5, // 0.5 statute miles minimum
    ceiling: null, // No ceiling restriction
    maxWindSpeed: 30, // 30 knots maximum
    maxCrosswind: 15, // 15 knots maximum crosswind
    maxTailwind: 10, // 10 knots maximum tailwind
    allowIMC: true,
  },

  /**
   * Commercial Pilot Requirements:
   * - Similar to instrument rated
   * - Higher wind tolerances
   */
  COMMERCIAL: {
    visibility: 0.5,
    ceiling: null,
    maxWindSpeed: 35,
    maxCrosswind: 18,
    maxTailwind: 10, // 10 knots maximum tailwind
    allowIMC: true,
  },
};

/**
 * Weather conditions that are always prohibitive regardless of training level
 */
export const PROHIBITIVE_CONDITIONS = [
  'thunderstorm',
  'severe icing',
  'tornado',
  'microburst',
  'volcanic ash',
] as const;

