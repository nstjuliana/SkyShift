"use strict";
/**
 * @fileoverview Tomorrow.io API client
 * @module lib/weather-tomorrow
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tomorrowClient = void 0;
const env_1 = require("@/lib/env");
/**
 * Weather code mapping
 */
const WEATHER_CODES = {
    1000: 'Clear',
    1100: 'Mostly Clear',
    1101: 'Partly Cloudy',
    1102: 'Mostly Cloudy',
    1001: 'Cloudy',
    2000: 'Fog',
    2100: 'Light Fog',
    4000: 'Drizzle',
    4001: 'Rain',
    4200: 'Light Rain',
    4201: 'Heavy Rain',
    5000: 'Snow',
    5001: 'Flurries',
    5100: 'Light Snow',
    5101: 'Heavy Snow',
    6000: 'Freezing Drizzle',
    6001: 'Freezing Rain',
    6200: 'Light Freezing Rain',
    6201: 'Heavy Freezing Rain',
    7000: 'Ice Pellets',
    7101: 'Heavy Ice Pellets',
    7102: 'Light Ice Pellets',
    8000: 'Thunderstorm',
};
/**
 * Tomorrow.io API client
 * Provides detailed aviation weather forecasts
 */
class TomorrowClient {
    constructor() {
        this.baseUrl = 'https://api.tomorrow.io/v4/timelines';
        if (!env_1.env.TOMORROW_IO_API_KEY) {
            throw new Error('TOMORROW_IO_API_KEY is not configured');
        }
        this.apiKey = env_1.env.TOMORROW_IO_API_KEY;
    }
    /**
     * Fetches weather forecast for a specific date/time
     *
     * @param lat - Latitude
     * @param lon - Longitude
     * @param timestampISO - ISO timestamp string for target time
     * @returns Weather data for target time
     *
     * @throws Error if API request fails
     */
    async getForecast(lat, lon, timestampISO) {
        try {
            const startTime = new Date(timestampISO).toISOString();
            const endTime = new Date(new Date(timestampISO).getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hour window
            const fields = [
                'temperature',
                'windSpeed',
                'windDirection',
                'windGust',
                'visibility',
                'cloudCover',
                'cloudBase', // Actual cloud base/ceiling height
                'precipitationIntensity',
                'precipitationType',
                'weatherCode',
            ].join(',');
            // Use imperial units to get temperature in Fahrenheit
            const url = `${this.baseUrl}?location=${lat},${lon}&fields=${fields}&timesteps=1h&startTime=${startTime}&endTime=${endTime}&units=imperial&apikey=${this.apiKey}`;
            console.log('[Tomorrow.io] Request:', {
                url: url.replace(this.apiKey, '***'),
                method: 'GET',
                params: {
                    location: `${lat},${lon}`,
                    fields,
                    timesteps: '1h',
                    startTime,
                    endTime,
                    units: 'imperial',
                    apikey: '***',
                },
                targetTime: timestampISO,
            });
            const response = await fetch(url, {
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Tomorrow.io API error: ${response.statusText} - ${errorText}`);
            }
            const data = await response.json();
            // Log the full response for debugging
            console.log('[Tomorrow.io] Response Status:', response.status, response.statusText);
            console.log('[Tomorrow.io] Full API Response:', JSON.stringify(data, null, 2));
            // Check for error in response (some APIs return errors with 200 status)
            if (data?.code || data?.type === 'error' || data?.error) {
                const errorMsg = data.message || data.error || 'Unknown error from Tomorrow.io API';
                throw new Error(`Tomorrow.io API error: ${errorMsg}`);
            }
            // Tomorrow.io v4 API can return data in different structures:
            // Option 1: { data: { timelines: [...] } }
            // Option 2: { timelines: [...] }
            // Option 3: Direct timelines array
            let timelines = [];
            if (data?.data?.timelines) {
                // Standard v4 API response structure
                timelines = data.data.timelines;
            }
            else if (data?.timelines) {
                // Alternative structure
                timelines = data.timelines;
            }
            else if (Array.isArray(data)) {
                // Direct array (unlikely but possible)
                timelines = data;
            }
            else {
                // Unknown structure - log and throw
                console.error('[Tomorrow.io] Unexpected response structure:', data);
                throw new Error(`Tomorrow.io API returned unexpected response format. Check server console for details.`);
            }
            if (timelines.length === 0) {
                throw new Error('No forecast timelines available in response');
            }
            // Get the closest interval to target time
            const targetTime = new Date(timestampISO).getTime();
            const intervals = timelines[0]?.intervals || [];
            if (intervals.length === 0) {
                throw new Error('No forecast intervals available for requested time');
            }
            const closest = intervals.reduce((prev, curr) => {
                const prevTime = new Date(prev.time).getTime();
                const currTime = new Date(curr.time).getTime();
                return Math.abs(currTime - targetTime) < Math.abs(prevTime - targetTime) ? curr : prev;
            });
            console.log('[Tomorrow.io] Selected interval:', JSON.stringify(closest, null, 2));
            const transformed = this.transformResponse(closest);
            console.log('[Tomorrow.io] Transformed weather data:', JSON.stringify(transformed, null, 2));
            return transformed;
        }
        catch (error) {
            throw new Error(`Failed to fetch Tomorrow.io forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Transforms Tomorrow.io API response to internal format
     *
     * @private
     */
    transformResponse(item) {
        const values = item.values;
        console.log('[Tomorrow.io] Raw values from API:', {
            windSpeed: values.windSpeed,
            windGust: values.windGust,
            visibility: values.visibility,
            temperature: values.temperature,
        });
        // Convert wind speed to knots
        // With units=imperial, wind speed might be in mph, but API docs suggest it's still m/s
        // Convert m/s to knots: 1 m/s = 1.944 knots
        const windSpeedKnots = values.windSpeed * 1.944;
        const windGustsKnots = values.windGust * 1.944;
        // Convert visibility to statute miles
        // With units=imperial, Tomorrow.io returns visibility in miles (no conversion needed)
        // With units=metric, it returns in meters (would need conversion, but we use imperial)
        // Since we're using units=imperial, visibility is already in miles
        const visibilityMiles = values.visibility;
        console.log('[Tomorrow.io] Converted values:', {
            windSpeedKnots,
            windGustsKnots,
            visibilityMiles,
            temperature: values.temperature,
        });
        // Get ceiling from cloudBase if available, otherwise estimate from cloud cover
        // With units=imperial, cloudBase is in miles (need to convert to feet)
        // With units=metric, cloudBase is in meters (would need conversion, but we use imperial)
        // 1 mile = 5280 feet
        let ceiling;
        if (values.cloudBase !== undefined && values.cloudBase !== null && values.cloudBase > 0) {
            // Convert cloud base from miles to feet
            // 1 mile = 5280 feet
            ceiling = values.cloudBase * 5280;
        }
        else {
            // Fallback: Estimate ceiling from cloud cover (rough approximation)
            // Lower cloud cover = higher ceiling
            ceiling = values.cloudCover < 50 ? 5000 : values.cloudCover < 80 ? 2000 : 1000;
        }
        // Map precipitation type
        const precipitationType = values.precipitationType === 0
            ? undefined
            : values.precipitationType === 1
                ? 'rain'
                : values.precipitationType === 2
                    ? 'snow'
                    : 'other';
        const weatherCode = values.weatherCode;
        const conditions = WEATHER_CODES[weatherCode] || 'Unknown';
        // Parse timestamp safely
        const timestamp = new Date(item.time);
        if (isNaN(timestamp.getTime())) {
            // If timestamp is invalid, use current time as fallback
            console.warn('[Tomorrow.io] Invalid timestamp from API:', item.time);
            timestamp.setTime(Date.now());
        }
        return {
            temperature: values.temperature,
            windSpeed: windSpeedKnots,
            windDirection: values.windDirection,
            windGusts: windGustsKnots,
            visibility: visibilityMiles,
            cloudCover: values.cloudCover,
            ceiling,
            precipitationType,
            precipitationIntensity: values.precipitationIntensity,
            conditions,
            description: conditions.toLowerCase(),
            timestamp,
        };
    }
}
// Export configured client instance
exports.tomorrowClient = new TomorrowClient();
