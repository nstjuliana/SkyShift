/**
 * @fileoverview AWS Lambda function for hourly weather checks
 * @module lambda/weather-check
 * 
 * This function runs on a schedule (EventBridge) to check weather
 * for all upcoming flights and update their status accordingly.
 * 
 * IMPORTANT: This function uses the weather service's checkUpcomingFlights method
 * but limits to 48 hours instead of 7 days. The function must be bundled
 * with all dependencies before deployment.
 */

import { PrismaClient } from '@prisma/client';
import { getWeatherForFlight } from '../../src/lib/weather';
import { evaluateWeatherSafety } from '../../src/services/weather-validation';
import { calculateCancellationProbability } from '../../src/services/cancellation-calculator';
import { sendWeatherConflictEmail } from './email';
import { airportDBClient } from '../../src/lib/airportdb';
import type { Location } from '../../src/types/flight';
import type { WeatherCondition } from '../../src/types/weather';

/**
 * Prisma client instance for Lambda
 */
const prisma = new PrismaClient({
  log: ['error'],
});

/**
 * Lambda handler function
 * 
 * @param event - EventBridge event (can be empty for scheduled invocations)
 * @returns Summary of weather checks performed
 */
export async function handler(event: any) {
  const startTime = Date.now();
  const summary = {
    flightsChecked: 0,
    conflictsDetected: 0,
    notificationsSent: 0,
    errors: [] as string[],
    executionTimeMs: 0,
  };

  try {
    console.log(JSON.stringify({
      level: 'info',
      message: 'Weather check job started',
      timestamp: new Date().toISOString(),
    }));

    // Calculate time window: flights scheduled within next 48 hours
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Fetch flights scheduled within next 48 hours with status SCHEDULED or AT_RISK
    const flights = await prisma.booking.findMany({
      where: {
        scheduledDate: {
          gte: now,
          lte: fortyEightHoursFromNow,
        },
        status: {
          in: ['SCHEDULED', 'AT_RISK'],
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            trainingLevel: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(JSON.stringify({
      level: 'info',
      message: 'Found flights to check',
      count: flights.length,
    }));

    // Check weather for each flight
    for (const flight of flights) {
      try {
        const result = await checkFlightWeather(flight.id, flight);
        summary.flightsChecked++;
        
        if (result.status === 'AT_RISK') {
          summary.conflictsDetected++;
          
          // Send notification emails
          const emailResults = await sendWeatherConflictNotifications(flight, result);
          summary.notificationsSent += emailResults.filter((r: any) => r.success).length;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        summary.errors.push(`Flight ${flight.id}: ${errorMessage}`);
        console.error(JSON.stringify({
          level: 'error',
          message: 'Error checking flight',
          flightId: flight.id,
          error: errorMessage,
        }));
      }
    }

    summary.executionTimeMs = Date.now() - startTime;

    console.log(JSON.stringify({
      level: 'info',
      message: 'Weather check job completed',
      ...summary,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        summary,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    summary.executionTimeMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(JSON.stringify({
      level: 'error',
      message: 'Weather check job failed',
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      summary,
    }));

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        summary,
        timestamp: new Date().toISOString(),
      }),
    };
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}

/**
 * Checks weather for a specific flight and updates status
 */
async function checkFlightWeather(
  bookingId: string,
  flight: any
): Promise<{
  status: string;
  probability: number;
  riskLevel: string;
  violations: string[];
}> {
  let departureLocation = flight.departureLocation;
  
  // Fetch runway heading if missing but ICAO code is available
  if (!departureLocation.runwayHeading && departureLocation.icaoCode) {
    try {
      const airportData = await airportDBClient.getAirportByICAO(departureLocation.icaoCode);
      if (airportData?.runwayHeading) {
        departureLocation = {
          ...departureLocation,
          runwayHeading: airportData.runwayHeading,
        };
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            departureLocation: departureLocation as any,
          },
        });
      }
    } catch (error) {
      console.warn(JSON.stringify({
        level: 'warn',
        message: 'Failed to fetch runway heading',
        error: error instanceof Error ? error.message : String(error),
      }));
    }
  }
  
  const runwayHeading = departureLocation.runwayHeading;
  const trainingLevel = flight.trainingLevel;

  // Get weather for flight
  const weatherResponse = await getWeatherForFlight(
    departureLocation,
    flight.scheduledDate
  );

  // Evaluate weather safety
  const evaluation = evaluateWeatherSafety(
    weatherResponse.data,
    trainingLevel,
    runwayHeading
  );

  // Calculate cancellation probability
  const condition = {
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

  // Determine new status
  const newStatus = probabilityResult.probability > 0 ? 'AT_RISK' : 'SCHEDULED';

  // Prepare weather data for storage
  const weatherDataForStorage = {
    ...weatherResponse.data,
    timestamp: weatherResponse.data.timestamp instanceof Date
      ? weatherResponse.data.timestamp.toISOString()
      : typeof weatherResponse.data.timestamp === 'string'
      ? weatherResponse.data.timestamp
      : new Date().toISOString(),
  };

  // Update booking
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: newStatus,
      cancellationProbability: probabilityResult.probability,
      riskLevel: probabilityResult.riskLevel,
    },
  });

  // Log weather check
  await prisma.weatherLog.create({
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
    status: newStatus,
    probability: probabilityResult.probability,
    riskLevel: probabilityResult.riskLevel,
    violations: evaluation.violations,
  };
}

/**
 * Sends weather conflict notification emails
 */
async function sendWeatherConflictNotifications(
  flight: any,
  result: { violations: string[]; probability: number; riskLevel: string }
) {
  const conflictReason = result.violations.join(', ') || 
                        'Weather conditions may prevent safe flight';
  
  const flightDate = new Date(flight.scheduledDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const departureLocation = (flight.departureLocation as any)?.name || 'Unknown';
  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const viewUrl = `${appUrl}/dashboard/flights/${flight.id}`;

  const results = [];

  // Send to student
  if (flight.student.email) {
    const emailResult = await sendWeatherConflictEmail({
      to: flight.student.email,
      studentName: flight.student.name || 'Student',
      flightDate,
      departureLocation,
      conflictReason,
      viewUrl,
    });
    results.push({ recipient: flight.student.email, ...emailResult });
  }

  // Send to instructor
  if (flight.instructor.email) {
    const emailResult = await sendWeatherConflictEmail({
      to: flight.instructor.email,
      studentName: flight.instructor.name || 'Instructor',
      flightDate,
      departureLocation,
      conflictReason,
      viewUrl,
    });
    results.push({ recipient: flight.instructor.email, ...emailResult });
  }

  return results;
}
