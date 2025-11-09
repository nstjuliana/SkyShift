/**
 * @fileoverview Common airports database
 * @module constants/airports
 */

import type { Location } from '@/types/flight';

/**
 * Common airports with ICAO codes and coordinates
 */
export const COMMON_AIRPORTS: Location[] = [
  // Major US Airports
  { name: 'KJFK - John F. Kennedy International', latitude: 40.6413, longitude: -73.7781, icaoCode: 'KJFK' },
  { name: 'KLAX - Los Angeles International', latitude: 33.9425, longitude: -118.4081, icaoCode: 'KLAX' },
  { name: 'KORD - Chicago O\'Hare International', latitude: 41.9786, longitude: -87.9048, icaoCode: 'KORD' },
  { name: 'KDFW - Dallas/Fort Worth International', latitude: 32.8969, longitude: -97.0381, icaoCode: 'KDFW' },
  { name: 'KDEN - Denver International', latitude: 39.8561, longitude: -104.6737, icaoCode: 'KDEN' },
  { name: 'KSFO - San Francisco International', latitude: 37.6213, longitude: -122.3790, icaoCode: 'KSFO' },
  { name: 'KSEA - Seattle-Tacoma International', latitude: 47.4502, longitude: -122.3088, icaoCode: 'KSEA' },
  { name: 'KATL - Hartsfield-Jackson Atlanta International', latitude: 33.6407, longitude: -84.4277, icaoCode: 'KATL' },
  { name: 'KMIA - Miami International', latitude: 25.7933, longitude: -80.2906, icaoCode: 'KMIA' },
  { name: 'KBOS - Boston Logan International', latitude: 42.3656, longitude: -71.0096, icaoCode: 'KBOS' },
  { name: 'KIAD - Washington Dulles International', latitude: 38.9445, longitude: -77.4558, icaoCode: 'KIAD' },
  { name: 'KDCA - Ronald Reagan Washington National', latitude: 38.8521, longitude: -77.0377, icaoCode: 'KDCA' },
  { name: 'KLGA - LaGuardia Airport', latitude: 40.7769, longitude: -73.8740, icaoCode: 'KLGA' },
  { name: 'KPHX - Phoenix Sky Harbor International', latitude: 33.4342, longitude: -112.0116, icaoCode: 'KPHX' },
  { name: 'KCLT - Charlotte Douglas International', latitude: 35.2144, longitude: -80.9473, icaoCode: 'KCLT' },
  { name: 'KLAS - McCarran International (Las Vegas)', latitude: 36.0840, longitude: -115.1537, icaoCode: 'KLAS' },
  { name: 'KMSP - Minneapolis-Saint Paul International', latitude: 44.8848, longitude: -93.2223, icaoCode: 'KMSP' },
  { name: 'KDTW - Detroit Metropolitan', latitude: 42.2162, longitude: -83.3554, icaoCode: 'KDTW' },
  { name: 'KPHL - Philadelphia International', latitude: 39.8719, longitude: -75.2411, icaoCode: 'KPHL' },
  { name: 'KBWI - Baltimore/Washington International', latitude: 39.1774, longitude: -76.6684, icaoCode: 'KBWI' },
  // Regional/General Aviation
  { name: 'KTEB - Teterboro Airport', latitude: 40.8501, longitude: -74.0608, icaoCode: 'KTEB' },
  { name: 'KVNY - Van Nuys Airport', latitude: 34.2098, longitude: -118.4900, icaoCode: 'KVNY' },
  { name: 'KAPA - Centennial Airport', latitude: 39.5701, longitude: -104.8493, icaoCode: 'KAPA' },
  { name: 'KFRG - Republic Airport', latitude: 40.7288, longitude: -73.4134, icaoCode: 'KFRG' },
  { name: 'KHPN - Westchester County Airport', latitude: 41.0670, longitude: -73.7076, icaoCode: 'KHPN' },
  { name: 'KSBN - South Bend Regional Airport (SBN)', latitude: 41.7087, longitude: -86.3173, icaoCode: 'KSBN' },
];

/**
 * Search airports by name or ICAO code
 * 
 * @param query - Search query
 * @returns Filtered airports
 */
export function searchAirports(query: string): Location[] {
  if (!query || query.trim().length === 0) {
    return COMMON_AIRPORTS;
  }

  const lowerQuery = query.toLowerCase().trim();
  const upperQuery = query.toUpperCase().trim();
  
  return COMMON_AIRPORTS.filter((airport) => {
    const nameMatch = airport.name.toLowerCase().includes(lowerQuery);
    const icaoMatch = airport.icaoCode?.toUpperCase().includes(upperQuery);
    
    // Extract IATA codes from names like "KSBN - South Bend Regional Airport (SBN)"
    const iataMatch = airport.name.match(/\(([A-Z]{3})\)/);
    const iataCode = iataMatch ? iataMatch[1] : null;
    const iataCodeMatch = iataCode && iataCode === upperQuery;
    
    return nameMatch || icaoMatch || iataCodeMatch;
  });
}

