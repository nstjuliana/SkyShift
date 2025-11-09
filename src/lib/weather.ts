/**
 * @fileoverview Smart weather router - selects appropriate API based on flight proximity
 * @module lib/weather
 */

import { tomorrowClient } from './weather-tomorrow';
import { openWeatherClient } from './weather-openweather';
import type { WeatherData, WeatherResponse } from '@/types/weather';
import type { WeatherSource, Location } from '@/types/flight';

/**
 * In-memory cache for weather responses
 * Key: `${source}:${lat},${lon},${hour}`
 */
const weatherCache = new Map<string, { data: WeatherData; expiresAt: number }>();

/**
 * Cache duration in milliseconds (30 minutes)
 */
const CACHE_DURATION = 30 * 60 * 1000;

/**
 * Gets weather for a flight, automatically selecting the appropriate API
 * - Flights < 4 days away: Uses Tomorrow.io (detailed aviation data)
 * - Flights >= 4 days away: Uses OpenWeather (general forecast)
 * 
 * @param location - Departure location
 * @param scheduledDate - Scheduled flight date/time
 * @returns Weather response with data and source
 * 
 * @throws Error if weather fetch fails
 */
export async function getWeatherForFlight(
  location: Location,
  scheduledDate: Date
): Promise<WeatherResponse> {
  const now = new Date();
  const daysUntilFlight = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  // Determine which API to use
  const useTomorrowIO = daysUntilFlight < 4;
  const source: WeatherSource = useTomorrowIO ? 'TOMORROW_IO' : 'OPENWEATHER';
  
  console.log('[Weather Router] Selecting weather API:', {
    location,
    scheduledDate: scheduledDate.toISOString(),
    daysUntilFlight: daysUntilFlight.toFixed(2),
    useTomorrowIO,
    selectedSource: source,
    reason: useTomorrowIO 
      ? 'Flight is less than 4 days away - using Tomorrow.io for detailed forecast'
      : 'Flight is 4+ days away - using OpenWeather for general forecast',
  });

  // Create cache key
  const hour = new Date(scheduledDate).setMinutes(0, 0, 0);
  const cacheKey = `${source}:${location.latitude},${location.longitude},${hour}`;

  // Check cache
  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expiresAt > now.getTime()) {
    console.log('[Weather Router] Cache HIT:', {
      cacheKey,
      expiresAt: new Date(cached.expiresAt).toISOString(),
    });
    return {
      data: cached.data,
      source,
      fetchedAt: new Date(),
    };
  }

  console.log('[Weather Router] Cache MISS - fetching from API:', { cacheKey });

  // Fetch weather from appropriate API
  let data: WeatherData;

  if (useTomorrowIO) {
    // Use Tomorrow.io for flights < 4 days away
    console.log('[Weather Router] Calling Tomorrow.io API...');
    data = await tomorrowClient.getForecast(
      location.latitude,
      location.longitude,
      scheduledDate.toISOString()
    );
  } else {
    // Use OpenWeather for flights >= 4 days away
    console.log('[Weather Router] Calling OpenWeather API...');
    data = await openWeatherClient.getForecast(
      location.latitude,
      location.longitude,
      scheduledDate
    );
  }

  // Cache the result
  weatherCache.set(cacheKey, {
    data,
    expiresAt: now.getTime() + CACHE_DURATION,
  });

  console.log('[Weather Router] Cached weather data:', {
    cacheKey,
    expiresAt: new Date(now.getTime() + CACHE_DURATION).toISOString(),
  });

  // Clean up expired cache entries periodically
  if (weatherCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of weatherCache.entries()) {
      if (value.expiresAt < now) {
        weatherCache.delete(key);
      }
    }
  }

  const response: WeatherResponse = {
    data,
    source,
    fetchedAt: new Date(),
  };

  console.log('[Weather Router] Final weather response:', {
    source: response.source,
    fetchedAt: response.fetchedAt.toISOString(),
    weatherData: JSON.stringify(response.data, null, 2),
  });

  return response;
}

/**
 * Clears the weather cache
 * Useful for testing or forcing fresh data
 */
export function clearWeatherCache(): void {
  weatherCache.clear();
}

