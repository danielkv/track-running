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
    });
  }

  return newPath;
};
