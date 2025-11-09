/**
 * @fileoverview Weather validation service - evaluates weather against training level minimums
 * @module services/weather-validation
 */

import type { WeatherData } from '@/types/weather';
import type { TrainingLevel } from '@prisma/client';
import { WEATHER_MINIMUMS } from '@/constants/weather-minimums';

/**
 * Weather safety evaluation result
 */
export interface WeatherEvaluation {
  /** Whether conditions are safe for flight */
  isSafe: boolean;
  /** List of minimums violations */
  violations: string[];
  /** Severity score (0-100, higher = more severe) */
  severityScore: number;
}

/**
 * Evaluates weather safety against training level minimums
 * 
 * @param weather - Weather data to evaluate
 * @param trainingLevel - Pilot training level
 * @returns Evaluation result with safety status and violations
 */
export function evaluateWeatherSafety(
  weather: WeatherData,
  trainingLevel: TrainingLevel
): WeatherEvaluation {
  const minimums = WEATHER_MINIMUMS[trainingLevel];
  const violations: string[] = [];
  let severityScore = 0;

  // Check visibility
  if (weather.visibility < minimums.visibility) {
    violations.push(
      `Visibility ${weather.visibility.toFixed(1)} mi below minimum of ${minimums.visibility} mi`
    );
    const violationSeverity = ((minimums.visibility - weather.visibility) / minimums.visibility) * 100;
    severityScore += violationSeverity;
  }

  // Check ceiling (if required)
  if (minimums.ceiling !== null && weather.ceiling !== undefined) {
    if (weather.ceiling < minimums.ceiling) {
      violations.push(
        `Ceiling ${weather.ceiling} ft below minimum of ${minimums.ceiling} ft`
      );
      const violationSeverity = ((minimums.ceiling - weather.ceiling) / minimums.ceiling) * 100;
      severityScore += violationSeverity;
    }
  }

  // Check wind speed
  if (weather.windSpeed > minimums.maxWindSpeed) {
    violations.push(
      `Wind speed ${weather.windSpeed.toFixed(1)} kt exceeds maximum of ${minimums.maxWindSpeed} kt`
    );
    const violationSeverity = ((weather.windSpeed - minimums.maxWindSpeed) / minimums.maxWindSpeed) * 100;
    severityScore += violationSeverity;
  }

  // Check wind gusts (if available)
  if (weather.windGusts && weather.windGusts > minimums.maxWindSpeed * 1.5) {
    violations.push(
      `Wind gusts ${weather.windGusts.toFixed(1)} kt exceed safe limits`
    );
    severityScore += 20;
  }

  // Check crosswind (simplified - assumes 90 degree crosswind component)
  // Crosswind = windSpeed * sin(windDirection - runwayHeading)
  // For simplicity, we'll use a conservative estimate
  const estimatedCrosswind = weather.windSpeed * 0.7; // Assume 45 degree angle
  if (estimatedCrosswind > minimums.maxCrosswind) {
    violations.push(
      `Estimated crosswind ${estimatedCrosswind.toFixed(1)} kt exceeds maximum of ${minimums.maxCrosswind} kt`
    );
    const violationSeverity = ((estimatedCrosswind - minimums.maxCrosswind) / minimums.maxCrosswind) * 50;
    severityScore += violationSeverity;
  }

  // Check IMC conditions (if not allowed)
  if (!minimums.allowIMC && weather.visibility < 3 && weather.cloudCover > 80) {
    violations.push('IMC conditions not allowed for this training level');
    severityScore += 30;
  }

  // Check for severe weather conditions
  const severeConditions = ['thunderstorm', 'tornado', 'severe', 'extreme'];
  const conditionsLower = weather.conditions.toLowerCase();
  if (severeConditions.some(condition => conditionsLower.includes(condition))) {
    violations.push(`Severe weather conditions: ${weather.conditions}`);
    severityScore += 50;
  }

  // Cap severity score at 100
  severityScore = Math.min(100, severityScore);

  return {
    isSafe: violations.length === 0,
    violations,
    severityScore,
  };
}

