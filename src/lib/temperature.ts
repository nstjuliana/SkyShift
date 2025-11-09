/**
 * @fileoverview Temperature conversion utilities
 * @module lib/temperature
 */

import type { TemperatureUnit } from '@prisma/client';

/**
 * Converts temperature between Fahrenheit and Celsius
 * 
 * @param temp - Temperature value
 * @param from - Source unit
 * @param to - Target unit
 * @returns Converted temperature
 */
export function convertTemperature(
  temp: number,
  from: 'F' | 'C',
  to: 'F' | 'C'
): number {
  if (from === to) {
    return temp;
  }

  if (from === 'F' && to === 'C') {
    // Fahrenheit to Celsius: (F - 32) * 5/9
    return (temp - 32) * (5 / 9);
  }

  if (from === 'C' && to === 'F') {
    // Celsius to Fahrenheit: (C * 9/5) + 32
    return (temp * 9) / 5 + 32;
  }

  return temp;
}

/**
 * Formats temperature with unit symbol
 * 
 * @param temp - Temperature value
 * @param unit - Temperature unit
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted temperature string
 */
export function formatTemperature(
  temp: number,
  unit: TemperatureUnit,
  decimals: number = 1
): string {
  const symbol = unit === 'FAHRENHEIT' ? '°F' : '°C';
  return `${temp.toFixed(decimals)}${symbol}`;
}

/**
 * Converts temperature to user's preferred unit
 * 
 * @param tempFahrenheit - Temperature in Fahrenheit
 * @param preferredUnit - User's preferred temperature unit
 * @returns Temperature in preferred unit
 */
export function toPreferredUnit(
  tempFahrenheit: number,
  preferredUnit: TemperatureUnit
): number {
  if (preferredUnit === 'CELSIUS') {
    return convertTemperature(tempFahrenheit, 'F', 'C');
  }
  return tempFahrenheit;
}

