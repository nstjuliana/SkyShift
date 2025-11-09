"use strict";
/**
 * @fileoverview AI-powered rescheduling service - generates intelligent reschedule options using OpenAI
 * @module services/ai-reschedule-service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRescheduleService = void 0;
const db_1 = require("@/lib/db");
const ai_1 = require("@/lib/ai");
const weather_1 = require("@/lib/weather");
const weather_minimums_1 = require("@/constants/weather-minimums");
const reschedule_1 = require("@/types/reschedule");
/**
 * AI rescheduling service
 * Generates intelligent reschedule options using OpenAI GPT-4o-mini
 */
class AIRescheduleService {
    /**
     * Generates 3 reschedule options for a booking using AI
     *
     * @param bookingId - Flight booking ID
     * @returns Array of 3 validated reschedule options
     *
     * @throws Error if booking not found or AI generation fails
     */
    async generateRescheduleOptions(bookingId) {
        // Fetch booking with all necessary data
        const booking = await db_1.db.booking.findUnique({
            where: { id: bookingId },
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
        if (!booking) {
            throw new Error(`Booking not found: ${bookingId}`);
        }
        if (booking.status !== 'AT_RISK') {
            throw new Error('Reschedule options can only be generated for flights at risk');
        }
        const trainingLevel = booking.trainingLevel;
        const minimums = weather_minimums_1.WEATHER_MINIMUMS[trainingLevel];
        const departureLocation = booking.departureLocation;
        // Get weather forecasts for next 7 days (sample 3-4 potential dates)
        const now = new Date();
        const potentialDates = [];
        for (let i = 1; i <= 7; i++) {
            const date = new Date(booking.scheduledDate);
            date.setDate(date.getDate() + i);
            // Only consider dates in the future
            if (date > now) {
                potentialDates.push(date);
            }
        }
        // Fetch weather for potential dates
        const weatherForecasts = await Promise.all(potentialDates.slice(0, 5).map(async (date) => {
            try {
                const weather = await (0, weather_1.getWeatherForFlight)(departureLocation, date);
                return {
                    date: date.toISOString(),
                    weather: weather.data,
                };
            }
            catch (error) {
                console.error(`[AI Reschedule] Failed to fetch weather for ${date.toISOString()}:`, error);
                return null;
            }
        }));
        const validForecasts = weatherForecasts.filter((f) => f !== null);
        // Build AI prompt
        const prompt = this.buildPrompt(booking, validForecasts, minimums, trainingLevel);
        // Call OpenAI
        const aiResponse = await this.callOpenAI(prompt);
        // Validate and parse response
        const parsed = reschedule_1.aiRescheduleResponseSchema.parse(aiResponse);
        // Validate dates and check instructor availability
        const validatedOptions = await this.validateAndFilterOptions(parsed.options, booking.instructorId, booking.duration);
        // Ensure we have exactly 3 options (fill with best available if needed)
        if (validatedOptions.length < 3) {
            throw new Error(`Only ${validatedOptions.length} valid options generated. Need 3.`);
        }
        return validatedOptions.slice(0, 3);
    }
    /**
     * Builds the prompt for OpenAI
     *
     * @private
     */
    buildPrompt(booking, weatherForecasts, minimums, trainingLevel) {
        const originalDate = new Date(booking.scheduledDate).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
        return `You are an AI flight scheduling assistant. A flight lesson has been flagged as AT_RISK due to weather conditions. Your task is to suggest 3 alternative date/time slots within the next 7 days that would be safe for flying.

ORIGINAL FLIGHT DETAILS:
- Scheduled Date/Time: ${originalDate}
- Duration: ${booking.duration} hours
- Training Level: ${trainingLevel}
- Location: ${booking.departureLocation.name} (${booking.departureLocation.latitude}, ${booking.departureLocation.longitude})

WEATHER MINIMUMS FOR ${trainingLevel} PILOT:
- Minimum Visibility: ${minimums.visibility} statute miles
- Minimum Ceiling: ${minimums.ceiling ? `${minimums.ceiling} feet AGL` : 'No restriction'}
- Maximum Wind Speed: ${minimums.maxWindSpeed} knots
- Maximum Crosswind: ${minimums.maxCrosswind} knots
- IMC Allowed: ${minimums.allowIMC ? 'Yes' : 'No'}

WEATHER FORECASTS FOR POTENTIAL DATES:
${weatherForecasts.map((f, i) => `
Option ${i + 1} - ${new Date(f.date).toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })}:
- Temperature: ${f.weather.temperature}°F
- Wind Speed: ${f.weather.windSpeed} knots
- Wind Direction: ${f.weather.windDirection}°
- Visibility: ${f.weather.visibility} statute miles
- Cloud Cover: ${f.weather.cloudCover}%
- Ceiling: ${f.weather.ceiling ? `${f.weather.ceiling} feet` : 'Unlimited'}
- Conditions: ${f.weather.conditions}
- Description: ${f.weather.description}
`).join('\n')}

REQUIREMENTS:
1. Generate exactly 3 reschedule options
2. Each option must be within the next 7 days from today
3. Each option must meet the weather minimums for ${trainingLevel} pilot
4. Prefer dates/times similar to the original schedule when possible
5. Consider instructor availability (assume they're available unless conflicting with existing bookings)
6. Provide clear reasoning for each option
7. Include a confidence score (0-100) for each option

RESPONSE FORMAT (JSON):
{
  "options": [
    {
      "suggestedDate": "ISO 8601 datetime string",
      "suggestedDuration": ${booking.duration},
      "reasoning": "Why this time slot is good",
      "weatherSummary": {
        "temperature": number,
        "windSpeed": number,
        "visibility": number,
        "conditions": "string"
      },
      "confidenceScore": number (0-100)
    }
  ],
  "analysisNote": "Brief summary of your analysis"
}

Return ONLY valid JSON, no markdown formatting.`;
    }
    /**
     * Calls OpenAI API with the prompt
     *
     * @private
     */
    async callOpenAI(prompt) {
        try {
            const completion = await ai_1.openai.chat.completions.create({
                model: ai_1.AI_MODEL,
                temperature: ai_1.AI_TEMPERATURE,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a flight scheduling AI assistant. Always respond with valid JSON only, no markdown formatting.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                response_format: { type: 'json_object' },
            });
            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }
            return JSON.parse(content);
        }
        catch (error) {
            console.error('[AI Reschedule] OpenAI API error:', error);
            throw new Error(`Failed to generate reschedule options: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Validates and filters reschedule options
     * Checks dates are valid and instructor is available
     *
     * @private
     */
    async validateAndFilterOptions(options, instructorId, duration) {
        const now = new Date();
        const validated = [];
        for (const option of options) {
            try {
                const suggestedDate = new Date(option.suggestedDate);
                // Check date is in future and within 7 days
                if (suggestedDate <= now) {
                    console.warn(`[AI Reschedule] Option rejected: date is in the past: ${option.suggestedDate}`);
                    continue;
                }
                const daysFromNow = (suggestedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                if (daysFromNow > 7) {
                    console.warn(`[AI Reschedule] Option rejected: date is more than 7 days away: ${option.suggestedDate}`);
                    continue;
                }
                // Check instructor availability
                const isAvailable = await this.checkInstructorAvailability(instructorId, suggestedDate, duration);
                if (!isAvailable) {
                    console.warn(`[AI Reschedule] Option rejected: instructor not available: ${option.suggestedDate}`);
                    continue;
                }
                validated.push(option);
            }
            catch (error) {
                console.error(`[AI Reschedule] Error validating option:`, error);
                continue;
            }
        }
        return validated;
    }
    /**
     * Checks if instructor is available at given time
     *
     * @private
     */
    async checkInstructorAvailability(instructorId, date, duration) {
        const startTime = new Date(date.getTime() - duration * 60 * 60 * 1000);
        const endTime = new Date(date.getTime() + duration * 60 * 60 * 1000);
        const conflictingFlight = await db_1.db.booking.findFirst({
            where: {
                instructorId,
                scheduledDate: {
                    gte: startTime,
                    lte: endTime,
                },
                status: {
                    notIn: ['CANCELLED', 'COMPLETED', 'RESCHEDULED'],
                },
            },
        });
        return !conflictingFlight;
    }
}
// Export singleton instance
exports.aiRescheduleService = new AIRescheduleService();
