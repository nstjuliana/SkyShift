/**
 * @fileoverview Weather service - checks flights against weather and updates status
 * @module services/weather-service
 */

import { db } from '@/lib/db';
import { getWeatherForFlight } from '@/lib/weather';
import { evaluateWeatherSafety } from './weather-validation';
import { calculateCancellationProbability } from './cancellation-calculator';
import type { Location } from '@/types/flight';
import type { WeatherCondition } from '@/types/weather';

/**
 * Weather service
 * Manages weather checks for flights and status updates
 */
class WeatherService {
  /**
   * Checks weather for a specific flight and updates status
   * 
   * @param bookingId - Flight booking ID
   * @returns Updated booking with weather data
   * 
   * @throws Error if booking not found or weather check fails
   */
  async checkFlightWeather(bookingId: string) {
    // Fetch booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: {
          select: {
            trainingLevel: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    const trainingLevel = booking.trainingLevel;
    const departureLocation = booking.departureLocation as Location;

    console.log('[Weather Service] Checking weather for flight:', {
      bookingId,
      departureLocation,
      scheduledDate: booking.scheduledDate.toISOString(),
      trainingLevel,
    });

    // Get weather for flight
    const weatherResponse = await getWeatherForFlight(
      departureLocation,
      booking.scheduledDate
    );

    console.log('[Weather Service] Weather response received:', {
      source: weatherResponse.source,
      fetchedAt: weatherResponse.fetchedAt.toISOString(),
      weatherData: JSON.stringify(weatherResponse.data, null, 2),
    });

    // Evaluate weather safety
    const evaluation = evaluateWeatherSafety(
      weatherResponse.data,
      trainingLevel
    );

    console.log('[Weather Service] Weather evaluation:', {
      isSafe: evaluation.isSafe,
      violations: evaluation.violations,
      severityScore: evaluation.severityScore,
    });

    // Calculate cancellation probability
    const condition: WeatherCondition = {
      weather: weatherResponse.data,
      source: weatherResponse.source,
      isSafe: evaluation.isSafe,
      violations: evaluation.violations,
      severityScore: evaluation.severityScore,
    };

    const probabilityResult = calculateCancellationProbability(
      condition,
      trainingLevel
    );

    console.log('[Weather Service] Cancellation probability calculation:', {
      probability: probabilityResult.probability,
      riskLevel: probabilityResult.riskLevel,
      reasons: probabilityResult.reasons,
    });

    // Determine new status
    const newStatus = probabilityResult.probability > 0 ? 'AT_RISK' : 'SCHEDULED';

    // Update booking
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        cancellationProbability: probabilityResult.probability,
        riskLevel: probabilityResult.riskLevel,
      },
    });

    // Prepare weather data for storage - convert Date objects to ISO strings
    const weatherDataForStorage = {
      ...weatherResponse.data,
      timestamp: weatherResponse.data.timestamp instanceof Date
        ? weatherResponse.data.timestamp.toISOString()
        : typeof weatherResponse.data.timestamp === 'string'
        ? weatherResponse.data.timestamp
        : new Date().toISOString(),
    };

    console.log('[Weather Service] Weather data prepared for storage:', JSON.stringify(weatherDataForStorage, null, 2));

    // Log weather check
    await db.weatherLog.create({
      data: {
        bookingId,
        weatherData: weatherDataForStorage as any,
        weatherSource: weatherResponse.source,
        cancellationProbability: probabilityResult.probability,
        riskLevel: probabilityResult.riskLevel,
        conflictDetails: {
          violations: evaluation.violations,
          reasons: probabilityResult.reasons,
        } as any,
      },
    });

    return {
      booking: updatedBooking,
      weather: weatherResponse.data,
      source: weatherResponse.source,
      probability: probabilityResult.probability,
      riskLevel: probabilityResult.riskLevel,
      violations: evaluation.violations,
    };
  }

  /**
   * Checks weather for all upcoming flights within 7 days
   * 
   * @returns Summary of checks performed
   */
  async checkUpcomingFlights() {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find all flights scheduled within next 7 days
    const flights = await db.booking.findMany({
      where: {
        scheduledDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
        status: {
          notIn: ['CANCELLED', 'COMPLETED'],
        },
      },
      include: {
        student: {
          select: {
            trainingLevel: true,
          },
        },
      },
    });

    const results = {
      checked: 0,
      atRisk: 0,
      errors: [] as string[],
    };

    // Check each flight
    for (const flight of flights) {
      try {
        const result = await this.checkFlightWeather(flight.id);
        results.checked++;
        if (result.booking.status === 'AT_RISK') {
          results.atRisk++;
        }
      } catch (error) {
        results.errors.push(`Flight ${flight.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }
}

// Export singleton instance
export const weatherService = new WeatherService();

