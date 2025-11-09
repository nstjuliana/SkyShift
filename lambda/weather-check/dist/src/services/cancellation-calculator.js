"use strict";
/**
 * @fileoverview Cancellation probability calculator
 * @module services/cancellation-calculator
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCancellationProbability = calculateCancellationProbability;
/**
 * Calculates cancellation probability based on weather conditions and training level
 *
 * Algorithm:
 * - Base probability on how close to minimums (0% if well above, 100% if at/below)
 * - Weight factors: wind (40%), visibility (30%), ceiling (20%), other (10%)
 * - Training level adjustments (student pilots = stricter)
 *
 * @param condition - Weather condition assessment
 * @param trainingLevel - Pilot training level
 * @returns Cancellation probability and risk level
 */
function calculateCancellationProbability(condition, trainingLevel) {
    const { weather, violations, severityScore } = condition;
    const reasons = [];
    // If safe, return low probability
    if (condition.isSafe) {
        return {
            probability: 0,
            riskLevel: 'LOW',
            reasons: ['Weather conditions meet all minimums'],
        };
    }
    // Base probability from severity score
    let probability = severityScore;
    // Apply training level multiplier (stricter for lower levels)
    const trainingMultipliers = {
        STUDENT: 1.2, // 20% stricter
        PRIVATE: 1.1, // 10% stricter
        INSTRUMENT: 1.0,
        COMMERCIAL: 0.9, // 10% more lenient
    };
    probability *= trainingMultipliers[trainingLevel];
    // Add specific violation weights
    violations.forEach((violation) => {
        if (violation.includes('Wind')) {
            probability += 5; // Wind is critical
            reasons.push('High wind conditions');
        }
        else if (violation.includes('Visibility')) {
            probability += 4; // Visibility is critical
            reasons.push('Low visibility conditions');
        }
        else if (violation.includes('Ceiling')) {
            probability += 3; // Ceiling is important
            reasons.push('Low ceiling conditions');
        }
        else if (violation.includes('Severe')) {
            probability += 15; // Severe weather is very dangerous
            reasons.push('Severe weather conditions');
        }
        else if (violation.includes('IMC')) {
            probability += 10; // IMC not allowed
            reasons.push('Instrument conditions not permitted');
        }
    });
    // Cap probability at 100%
    probability = Math.min(100, Math.max(0, probability));
    // Determine risk level
    let riskLevel;
    if (probability <= 30) {
        riskLevel = 'LOW';
    }
    else if (probability <= 60) {
        riskLevel = 'MODERATE';
    }
    else if (probability <= 85) {
        riskLevel = 'HIGH';
    }
    else {
        riskLevel = 'EXTREME';
    }
    // Add general reason if no specific reasons
    if (reasons.length === 0) {
        reasons.push('Weather conditions approaching minimums');
    }
    return {
        probability: Math.round(probability),
        riskLevel,
        reasons,
    };
}
