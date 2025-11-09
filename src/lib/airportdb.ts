/**
 * @fileoverview AirportDB.io API client
 * @module lib/airportdb
 */

import type { Location } from '@/types/flight';
import { env } from '@/lib/env';

/**
 * AirportDB.io API runway data
 */
interface AirportDBRunway {
  id?: string;
  airport_ref?: string;
  length_ft?: number;
  width_ft?: number;
  surface?: string;
  lighted?: number;
  closed?: number;
  he_ident?: string; // High end identifier
  he_latitude_deg?: number;
  he_longitude_deg?: number;
  he_elevation_ft?: number;
  he_heading_degT?: number; // High end heading in degrees True
  le_ident?: string; // Low end identifier
  le_latitude_deg?: number;
  le_longitude_deg?: number;
  le_elevation_ft?: number;
  le_heading_degT?: number; // Low end heading in degrees True
}

/**
 * AirportDB.io API response types
 * Based on AirportDB.io API v1 structure
 */
interface AirportDBItem {
  id?: string;
  ident?: string; // ICAO or IATA code
  type?: string;
  name?: string;
  latitude_deg?: number;
  longitude_deg?: number;
  elevation_ft?: number;
  continent?: string;
  iso_country?: string;
  iso_region?: string;
  municipality?: string;
  scheduled_service?: string;
  gps_code?: string; // ICAO code
  iata_code?: string; // IATA code
  local_code?: string;
  home_link?: string;
  wikipedia_link?: string;
  keywords?: string;
  // AirportDB.io actual response format (alternative field names)
  icao?: string;
  iata?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  // Runway data (may be in separate endpoint or included)
  runways?: AirportDBRunway[];
}

/**
 * AirportDB.io API client
 * Provides methods to search airports by name or code
 */
class AirportDBClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://airportdb.io/api/v1';

  constructor() {
    if (!env.AIRPORTDB_API_KEY) {
      throw new Error('AIRPORTDB_API_KEY is not configured');
    }
    this.apiKey = env.AIRPORTDB_API_KEY;
  }

  /**
   * Searches airports by query string
   * AirportDB.io only supports lookup by ICAO code (4 letters)
   * If user provides 3-letter code, prefix with "K" to convert IATA to ICAO
   * 
   * @param query - Search query (airport code)
   * @param limit - Maximum number of results (default: 20, not used for single lookup)
   * @returns Array of airport locations
   */
  async searchAirports(query: string, limit: number = 20): Promise<Location[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    let trimmedQuery = query.trim().toUpperCase();
    
    // If 3-letter code, prefix with "K" to convert IATA to ICAO (US airports)
    if (trimmedQuery.length === 3 && /^[A-Z]{3}$/.test(trimmedQuery)) {
      trimmedQuery = `K${trimmedQuery}`;
      console.log('[AirportDB] Converted 3-letter code to ICAO:', trimmedQuery);
    }
    
    console.log('[AirportDB] Searching for:', trimmedQuery);
    
    try {
      const airport = await this.getAirportByICAO(trimmedQuery);
      if (airport) {
        console.log('[AirportDB] Found airport:', airport);
        return [airport];
      }
      console.log('[AirportDB] No airport found for:', trimmedQuery);
      return [];
    } catch (error) {
      console.error('[AirportDB] Search error for', trimmedQuery, ':', error);
      return [];
    }
  }

  /**
   * Fetches runway data for an airport
   * Uses AirportDB.io API format: /airport/{ICAO}/runways?apiToken={apiToken}
   * 
   * @param icaoCode - ICAO airport code
   * @returns Array of runway data or empty array if not found
   */
  private async getRunways(icaoCode: string): Promise<AirportDBRunway[]> {
    if (!this.apiKey) {
      return [];
    }

    const url = `${this.baseUrl}/airport/${icaoCode.toUpperCase()}/runways?apiToken=${this.apiKey}`;
    console.log('[AirportDB] Fetching runways:', url.replace(this.apiKey, '***'));
    
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('[AirportDB] No runways found (404):', icaoCode);
          return [];
        }
        console.warn('[AirportDB] Runway API error:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      console.log('[AirportDB] Runway API response:', JSON.stringify(data, null, 2));
      // Handle both array and object responses
      const runways = Array.isArray(data) ? data : (data.runways || []);
      console.log('[AirportDB] Found', runways.length, 'runways for', icaoCode);
      if (runways.length > 0) {
        console.log('[AirportDB] First runway data:', JSON.stringify(runways[0], null, 2));
        console.log('[AirportDB] First runway he_heading_degT:', runways[0].he_heading_degT);
        console.log('[AirportDB] First runway le_heading_degT:', runways[0].le_heading_degT);
      }
      return runways as AirportDBRunway[];
    } catch (error) {
      console.warn('[AirportDB] Exception fetching runways:', error);
      return [];
    }
  }

  /**
   * Gets airport by ICAO code
   * Uses AirportDB.io API format: /airport/{ICAO}?apiToken={apiToken}
   * Also fetches runway data to extract runway heading
   * 
   * @param icaoCode - ICAO airport code
   * @returns Airport location or null if not found
   * 
   * @throws Error if API request fails (except 404)
   */
  async getAirportByICAO(icaoCode: string): Promise<Location | null> {
    if (!this.apiKey) {
      const error = 'AIRPORTDB_API_KEY is not configured';
      console.error('[AirportDB]', error);
      throw new Error(error);
    }

    const url = `${this.baseUrl}/airport/${icaoCode.toUpperCase()}?apiToken=${this.apiKey}`;
    console.log('[AirportDB] Fetching:', url.replace(this.apiKey, '***'));
    
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
      });

      console.log('[AirportDB] Response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('[AirportDB] Airport not found (404):', icaoCode);
          return null;
        }
        const errorText = await response.text();
        console.error('[AirportDB] API error:', response.status, errorText);
        throw new Error(`AirportDB API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[AirportDB] Response data:', JSON.stringify(data, null, 2));
      
      const airport: AirportDBItem = data;
      
      // Handle AirportDB.io response format
      const icaoCodeValue = airport.icao || airport.gps_code || airport.ident || icaoCode.toUpperCase();
      const iataCode = airport.iata || airport.iata_code;
      const displayCode = icaoCodeValue || iataCode || icaoCode.toUpperCase();
      const airportName = airport.name || airport.municipality || 'Unknown Airport';
      const latitude = airport.latitude || airport.latitude_deg;
      const longitude = airport.longitude || airport.longitude_deg;

      if (!latitude || !longitude) {
        console.error('[AirportDB] Missing coordinates in response:', airport);
        throw new Error('Airport data missing coordinates');
      }

      // Extract primary runway heading from runway data
      // First check if runways are included in airport response
      let runways = airport.runways || [];
      
      // If not included, fetch runways separately
      if (runways.length === 0) {
        runways = await this.getRunways(icaoCode);
      }

      // Use the first available runway heading (typically the primary runway)
      let runwayHeading: number | undefined;
      if (runways.length > 0) {
        // Prefer high end heading, fallback to low end
        const primaryRunway = runways[0];
        runwayHeading = primaryRunway.he_heading_degT ?? primaryRunway.le_heading_degT;
        
        if (runwayHeading !== undefined) {
          console.log('[AirportDB] Found runway heading:', runwayHeading, 'for runway:', primaryRunway.he_ident || primaryRunway.le_ident);
        } else {
          console.log('[AirportDB] Runway found but no heading data available');
        }
      } else {
        console.log('[AirportDB] No runway data available for', icaoCode);
      }

      const result: Location = {
        name: `${displayCode} - ${airportName}`,
        latitude,
        longitude,
        icaoCode: icaoCodeValue,
        runwayHeading,
      };
      
      console.log('[AirportDB] Parsed result:', result);
      return result;
    } catch (error) {
      console.error('[AirportDB] Exception:', error);
      throw error;
    }
  }
}

// Export configured client instance
export const airportDBClient = new AirportDBClient();

