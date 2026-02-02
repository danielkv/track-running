import { Coordinate } from '../types/Run';

export const calculateDistance = (coords: Coordinate[]): number => {
  if (coords.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < coords.length; i++) {
    const lat1 = coords[i - 1].latitude;
    const lon1 = coords[i - 1].longitude;
    const lat2 = coords[i].latitude;
    const lon2 = coords[i].longitude;
    
    // Haversine formula
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    totalDistance += R * c;
  }
  
  return totalDistance;
};

export const resamplePath = (path: Coordinate[], numPoints: number): Coordinate[] => {
  if (numPoints <= 1) return [];
  if (path.length < 2) return path;

  // Calculate cumulative distances
  const distances: number[] = [0];
  let totalDist = 0;
  for (let i = 1; i < path.length; i++) {
    const d = calculateDistance([path[i - 1], path[i]]);
    totalDist += d;
    distances.push(totalDist);
  }

  const step = totalDist / (numPoints - 1);
  const newPath: Coordinate[] = [];
  
  let currentOriginalIdx = 0;

  for (let i = 0; i < numPoints; i++) {
    const targetDist = i * step;
    
    // Handle the last point specifically to avoid rounding errors
    if (i === numPoints - 1) {
      newPath.push(path[path.length - 1]);
      break;
    }

    // Find the segment that contains the target distance
    while (currentOriginalIdx < distances.length - 2 && distances[currentOriginalIdx + 1] < targetDist) {
      currentOriginalIdx++;
    }

    const dStart = distances[currentOriginalIdx];
    const dEnd = distances[currentOriginalIdx + 1];
    const segmentLen = dEnd - dStart;

    if (segmentLen <= 0) {
      newPath.push(path[currentOriginalIdx]);
      continue;
    }

    const fraction = Math.max(0, Math.min(1, (targetDist - dStart) / segmentLen));
    const p1 = path[currentOriginalIdx];
    const p2 = path[currentOriginalIdx + 1];

    newPath.push({
      latitude: p1.latitude + (p2.latitude - p1.latitude) * fraction,
      longitude: p1.longitude + (p2.longitude - p1.longitude) * fraction,
      timestamp: p1.timestamp + (p2.timestamp - p1.timestamp) * fraction,
    });
  }

  return newPath;
};

/**
 * Calculates the minimum distance from a point to a path (segment by segment).
 */
export const distanceToPath = (point: Coordinate, path: Coordinate[]): number => {
  if (path.length < 2) return calculateDistance([point, path[0]]);

  let minDistance = Number.MAX_VALUE;

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const dist = distanceToSegment(point, p1, p2);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return minDistance;
};

/**
 * Helper to calculate distance from point p to segment v-w
 */
function distanceToSegment(p: Coordinate, v: Coordinate, w: Coordinate): number {
  const l2 = distanceSquared(v, w);
  if (l2 === 0) return calculateDistance([p, v]);

  // Convert to Cartesian approximation for projection ratio t
  // (Not 100% accurate for lat/lon but good enough for small segments)
  // For better accuracy we should project on sphere, but given the segments are short:
  
  // Let's use simple flat-earth approximation for the projection factor 't'
  // Then use Haversine for the final distance
  
  const x = p.longitude;
  const y = p.latitude;
  const x1 = v.longitude;
  const y1 = v.latitude;
  const x2 = w.longitude;
  const y2 = w.latitude;

  let t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / ((x2 - x1) ** 2 + (y2 - y1) ** 2);
  t = Math.max(0, Math.min(1, t));
  
  const projection: Coordinate = {
    latitude: y1 + t * (y2 - y1),
    longitude: x1 + t * (x2 - x1),
    timestamp: 0 // dummy
  };

  return calculateDistance([p, projection]);
}

function distanceSquared(v: Coordinate, w: Coordinate): number {
  return (v.latitude - w.latitude) ** 2 + (v.longitude - w.longitude) ** 2;
}
