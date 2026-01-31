import * as Crypto from 'expo-crypto';
import { Coordinate } from '../types/Run';
import { Territory } from '../types/Territory';

export const CLOSURE_THRESHOLD_METERS = 50; // Distance to consider the loop closed

/**
 * Calculates the distance between two coordinates in meters (Haversine formula).
 */
export function getDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks if the route forms a closed loop.
 * A loop is closed if the end point is within THRESHOLD of the start point,
 * AND the route has at least some significant length (e.g. > 3 points).
 */
export function isLoopClosed(route: Coordinate[]): boolean {
    if (route.length < 10) return false; // Too short to be a valid territory
    
    const start = route[0];
    const end = route[route.length - 1];
    
    // Check if end is close to start
    const distanceToStart = getDistance(start, end);
    return distanceToStart <= CLOSURE_THRESHOLD_METERS;
}

/**
 * Calculates the center (centroid) of the polygon.
 */
function calculateCentroid(coordinates: Coordinate[]): Coordinate {
    let latSum = 0;
    let lngSum = 0;
    coordinates.forEach(c => {
        latSum += c.latitude;
        lngSum += c.longitude;
    });
    return {
        latitude: latSum / coordinates.length,
        longitude: lngSum / coordinates.length,
        timestamp: Date.now()
    };
}

/**
 * Simple area calculation (Shoelace formula approximation for small areas)
 * or just placeholder.
 */
function calculateArea(coordinates: Coordinate[]): number {
    // Placeholder: returning 0 for now as it's complex on a sphere and not strictly required yet.
    return 0;
}


/**
 * Processes a route and returns a Territory if a loop is detected.
 */
export function detectTerritoryFromRoute(route: Coordinate[]): Territory | null {
    if (!isLoopClosed(route)) {
        return null; // No territory formed
    }

    // Close the loop perfectly for the polygon
    const polygonCoordinates = [...route];
    if (getDistance(polygonCoordinates[0], polygonCoordinates[polygonCoordinates.length-1]) > 0) {
        polygonCoordinates.push(polygonCoordinates[0]);
    }
    
    const center = calculateCentroid(polygonCoordinates);
    
    return {
        id: Crypto.randomUUID(),
        coordinates: polygonCoordinates,
        center: center,
        status: 'owned',
        area: calculateArea(polygonCoordinates),
        createdAt: Date.now()
    };
}
