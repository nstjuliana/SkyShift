"use strict";
/**
 * @fileoverview OpenWeather API client
 * @module lib/weather-openweather
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.openWeatherClient = void 0;
const env_1 = require("@/lib/env");
/**
 * OpenWeather API client
 * Provides methods to fetch current weather and forecasts
 */
class OpenWeatherClient {
    constructor() {
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        if (!env_1.env.OPENWEATHER_API_KEY) {
            throw new Error('OPENWEATHER_API_KEY is not configured');
        }
        this.apiKey = env_1.env.OPENWEATHER_API_KEY;
    }
    /**
     * Fetches current weather for a location
     *
     * @param lat - Latitude
     * @param lon - Longitude
     * @returns Current weather data
     *
     * @throws Error if API request fails
     */
    async getCurrentWeather(lat, lon) {
        try {
            const response = await fetch(`${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`, {
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok) {
                throw new Error(`OpenWeather API error: ${response.statusText}`);
            }
            const data = await response.json();
            return this.transformResponse(data);
        }
        catch (error) {
            throw new Error(`Failed to fetch OpenWeather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Fetches weather forecast for a specific date/time
     *
     * @param lat - Latitude
     * @param lon - Longitude
     * @param targetDate - Target date/time for forecast
     * @returns Weather data for target time
     *
     * @throws Error if API request fails
     */
    async getForecast(lat, lon, targetDate) {
        try {
            const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`;
            console.log('[OpenWeather] Request:', {
                url: url.replace(this.apiKey, '***'),
                method: 'GET',
                params: {
                    lat,
                    lon,
                    appid: '***',
                    units: 'imperial',
                },
                targetDate: targetDate.toISOString(),
            });
            const response = await fetch(url, {
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[OpenWeather] Error Response:', errorText);
                throw new Error(`OpenWeather API error: ${response.statusText} - ${errorText}`);
            }
            const data = await response.json();
            console.log('[OpenWeather] Response Status:', response.status, response.statusText);
            console.log('[OpenWeather] Full API Response:', JSON.stringify(data, null, 2));
            // Find closest forecast to target date
            const targetTime = targetDate.getTime();
            const closest = data.list.reduce((prev, curr) => {
                const prevTime = new Date(prev.dt_txt).getTime();
                const currTime = new Date(curr.dt_txt).getTime();
                return Math.abs(currTime - targetTime) < Math.abs(prevTime - targetTime) ? curr : prev;
            });
            console.log('[OpenWeather] Selected forecast item:', JSON.stringify(closest, null, 2));
            const transformed = this.transformResponse(closest);
            console.log('[OpenWeather] Transformed weather data:', JSON.stringify(transformed, null, 2));
            return transformed;
        }
        catch (error) {
            throw new Error(`Failed to fetch OpenWeather forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Transforms OpenWeather API response to internal format
     *
     * @private
     */
    transformResponse(data) {
        // Convert m/s to knots (1 m/s = 1.944 knots)
        const windSpeedKnots = data.wind.speed * 1.944;
        const windGustsKnots = data.wind.gust ? data.wind.gust * 1.944 : undefined;
        // Convert meters to statute miles (1 meter = 0.000621371 miles)
        const visibilityMiles = data.visibility * 0.000621371;
        // Parse timestamp safely
        const timestamp = new Date(data.dt * 1000);
        if (isNaN(timestamp.getTime())) {
            // If timestamp is invalid, use current time as fallback
            console.warn('[OpenWeather] Invalid timestamp from API:', data.dt);
            timestamp.setTime(Date.now());
        }
        return {
            temperature: data.main.temp, // Already in Fahrenheit with units=imperial
            windSpeed: windSpeedKnots,
            windDirection: data.wind.deg,
            windGusts: windGustsKnots,
            visibility: visibilityMiles,
            cloudCover: data.clouds.all,
            conditions: data.weather[0].main,
            description: data.weather[0].description,
            timestamp,
        };
    }
}
// Export configured client instance
exports.openWeatherClient = new OpenWeatherClient();
