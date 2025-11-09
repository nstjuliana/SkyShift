"use strict";
/**
 * @fileoverview Weather validation service - evaluates weather against training level minimums
 * @module services/weather-validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateWeatherSafety = evaluateWeatherSafety;
const weather_minimums_1 = require("@/constants/weather-minimums");
/**
 * Evaluates weather safety against training level minimums
 *
 * @param weather - Weather data to evaluate
 * @param trainingLevel - Pilot training level
 * @param runwayHeading - Optional runway heading in degrees (0-360). If not provided, uses conservative worst-case estimate.
 * @returns Evaluation result with safety status and violations
 */
function evaluateWeatherSafety(weather, trainingLevel, runwayHeading) {
    const minimums = weather_minimums_1.WEATHER_MINIMUMS[trainingLevel];
    const violations = [];
    let severityScore = 0;
    // Check visibility
    if (weather.visibility < minimums.visibility) {
        violations.push(`Visibility ${weather.visibility.toFixed(1)} mi below minimum of ${minimums.visibility} mi`);
        const violationSeverity = ((minimums.visibility - weather.visibility) / minimums.visibility) * 100;
        severityScore += violationSeverity;
    }
    // Check ceiling (if required)
    if (minimums.ceiling !== null && weather.ceiling !== undefined) {
        if (weather.ceiling < minimums.ceiling) {
            violations.push(`Ceiling ${weather.ceiling} ft below minimum of ${minimums.ceiling} ft`);
            const violationSeverity = ((minimums.ceiling - weather.ceiling) / minimums.ceiling) * 100;
            severityScore += violationSeverity;
        }
    }
    // Check wind speed
    if (weather.windSpeed > minimums.maxWindSpeed) {
        violations.push(`Wind speed ${weather.windSpeed.toFixed(1)} kt exceeds maximum of ${minimums.maxWindSpeed} kt`);
        const violationSeverity = ((weather.windSpeed - minimums.maxWindSpeed) / minimums.maxWindSpeed) * 100;
        severityScore += violationSeverity;
    }
    // Check wind gusts (if available)
    if (weather.windGusts && weather.windGusts > minimums.maxWindSpeed * 1.5) {
        violations.push(`Wind gusts ${weather.windGusts.toFixed(1)} kt exceed safe limits`);
        severityScore += 20;
    }
    // Check crosswind AND headwind/tailwind using proper trig
    let crosswindKt = 0;
    let headwindKt = 0; // Positive = headwind, negative = tailwind component
    let tailwindKt = 0;
    if (runwayHeading !== undefined &&
        weather.windDirection !== undefined &&
        weather.windSpeed !== undefined) {
        // Angle difference and normalization (0–180°)
        let angleDiff = Math.abs(weather.windDirection - runwayHeading);
        angleDiff = angleDiff <= 180 ? angleDiff : 360 - angleDiff; // Cleaner than if()
        const angleDiffRad = angleDiff * (Math.PI / 180);
        // Full wind components
        const speed = weather.windSpeed;
        crosswindKt = Math.abs(speed * Math.sin(angleDiffRad)); // Always magnitude
        headwindKt = speed * Math.cos(angleDiffRad); // Signed: +head / -tail
        // Tailwind is the negative part
        tailwindKt = headwindKt < 0 ? -headwindKt : 0;
    }
    else {
        // Conservative fallbacks if any data missing
        crosswindKt = weather.windSpeed ?? 0; // Assume full crosswind
        tailwindKt = weather.windSpeed ?? 0; // Assume full tailwind (worst for limits)
        headwindKt = 0;
    }
    // === Crosswind Check ===
    if (crosswindKt > minimums.maxCrosswind) {
        violations.push(`Crosswind ${crosswindKt.toFixed(1)} kt exceeds maximum of ${minimums.maxCrosswind} kt`);
        const violationSeverity = ((crosswindKt - minimums.maxCrosswind) / minimums.maxCrosswind) * 50;
        severityScore += Math.max(violationSeverity, 0);
    }
    // === Tailwind Check ===
    if (tailwindKt > minimums.maxTailwind) {
        violations.push(`Tailwind ${tailwindKt.toFixed(1)} kt exceeds maximum of ${minimums.maxTailwind} kt`);
        const violationSeverity = ((tailwindKt - minimums.maxTailwind) / minimums.maxTailwind) * 50;
        severityScore += Math.max(violationSeverity, 0);
    }
    // Optional: Enhanced reporting (e.g., for UI or logs)
    if (runwayHeading !== undefined && weather.windDirection !== undefined) {
        const crosswindSide = headwindKt >= 0
            ? (weather.windDirection - runwayHeading + 360) % 360 <= 180 ? 'left' : 'right'
            : (weather.windDirection - runwayHeading + 360) % 360 <= 180 ? 'right' : 'left';
        console.log(`Wind: ${weather.windSpeed} kt @ ${weather.windDirection}° → ` +
            `Crosswind: ${crosswindKt.toFixed(1)} kt (from ${crosswindSide}), ` +
            `Headwind: ${headwindKt > 0 ? headwindKt.toFixed(1) : 0} kt, ` +
            `Tailwind: ${tailwindKt.toFixed(1)} kt`);
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
