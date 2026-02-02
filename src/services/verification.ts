import { Coordinate } from '../types/Run';
import { calculateDistance, distanceToPath } from '../utils/geo';

// Environment variable to disable anti-cheat in DEV
// In a real app, this would be imported from a config file
const DISABLE_ANTI_CHEAT = process.env.EXPO_PUBLIC_DISABLE_ANTI_CHEAT === 'true';

const PROXIMITY_THRESHOLD_METERS = 50;
const OFF_ROUTE_THRESHOLD_METERS = 30;
const MAX_SPEED_KMH = 40; // Max reasonable speed for running

/**
 * Checks if the user is close enough to the start of the route.
 */
export function checkProximityToStart(
  userLocation: Coordinate,
  routePath: Coordinate[]
): boolean {
  if (!routePath || routePath.length === 0) return false;

  const startPoint = routePath[0];
  const distance = calculateDistance([userLocation, startPoint]);

  return distance <= PROXIMITY_THRESHOLD_METERS;
}

/**
 * Checks if the user is on the route (within a threshold).
 */
export function isOnRoute(
  userLocation: Coordinate,
  routePath: Coordinate[]
): boolean {
  if (!routePath || routePath.length < 2) return true; // Can't determine if path is invalid

  const distance = distanceToPath(userLocation, routePath);
  return distance <= OFF_ROUTE_THRESHOLD_METERS;
}

/**
 * Validates the run pace to detect potential cheating.
 */
export function validateRunPace(
  runDurationSeconds: number,
  runDistanceMeters: number
): { valid: boolean; reason?: string } {
  if (DISABLE_ANTI_CHEAT) {
    return { valid: true };
  }

  if (runDurationSeconds <= 0) return { valid: false, reason: 'Invalid duration' };

  const speedMetersPerSecond = runDistanceMeters / runDurationSeconds;
  const speedKmh = speedMetersPerSecond * 3.6;

  if (speedKmh > MAX_SPEED_KMH) {
    return { 
      valid: false, 
      reason: `Speed too high (${speedKmh.toFixed(1)} km/h). Max allowed: ${MAX_SPEED_KMH} km/h` 
    };
  }

  return { valid: true };
}
