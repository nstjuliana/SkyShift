"use strict";
/**
 * @fileoverview Temperature conversion utilities
 * @module lib/temperature
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTemperature = convertTemperature;
exports.formatTemperature = formatTemperature;
exports.toPreferredUnit = toPreferredUnit;
/**
 * Converts temperature between Fahrenheit and Celsius
 *
 * @param temp - Temperature value
 * @param from - Source unit
 * @param to - Target unit
 * @returns Converted temperature
 */
function convertTemperature(temp, from, to) {
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
function formatTemperature(temp, unit, decimals = 1) {
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
function toPreferredUnit(tempFahrenheit, preferredUnit) {
    if (preferredUnit === 'CELSIUS') {
        return convertTemperature(tempFahrenheit, 'F', 'C');
    }
    return tempFahrenheit;
}
