import fs from 'fs';
import path from 'path';

/**
 * Script to convert GPX files to the 'route' format used in the Database.
 * Usage: yarn gpx-to-route <path-to-gpx-file>
 */

const gpxFilePath = process.argv[2];

if (!gpxFilePath) {
  console.error('Usage: yarn gpx-to-route <path-to-gpx-file>');
  process.exit(1);
}

try {
  const absolutePath = path.isAbsolute(gpxFilePath) 
    ? gpxFilePath 
    : path.resolve(process.cwd(), gpxFilePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const gpxContent = fs.readFileSync(absolutePath, 'utf-8');

  // Regex to match <trkpt lat="..." lon="...">
  const trkptRegex = /<trkpt\s+([^>]*lat="([^"]+)"[^>]*lon="([^"]+)"|[^>]*lon="([^"]+)"[^>]*lat="([^"]+)"[^>]*)/g;
  const eleRegex = /<ele>([^<]+)<\/ele>/;
  
  const routePath: any[] = [];
  let match;

  while ((match = trkptRegex.exec(gpxContent)) !== null) {
    let lat, lon;
    
    if (match[2] && match[3]) {
      lat = parseFloat(match[2]);
      lon = parseFloat(match[3]);
    } else if (match[4] && match[5]) {
      lon = parseFloat(match[4]);
      lat = parseFloat(match[5]);
    }

    if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
      const segmentEnd = gpxContent.indexOf('</trkpt>', match.index);
      const segment = gpxContent.substring(match.index, segmentEnd !== -1 ? segmentEnd : undefined);
      const eleMatch = eleRegex.exec(segment);
      const elevation = eleMatch ? parseFloat(eleMatch[1]) : undefined;

      routePath.push({
        latitude: lat,
        longitude: lon,
        timestamp: Date.now(),
        ...(elevation !== undefined && { elevation })
      });
    }
  }

  if (routePath.length === 0) {
    console.warn('No track points found in the GPX file.');
  } else {
    // Basic distance calculation (Haversine)
    let total_distance = 0;
    for (let i = 1; i < routePath.length; i++) {
        const p1 = routePath[i-1];
        const p2 = routePath[i];
        const R = 6371e3;
        const φ1 = (p1.latitude * Math.PI) / 180;
        const φ2 = (p2.latitude * Math.PI) / 180;
        const Δφ = ((p2.latitude - p1.latitude) * Math.PI) / 180;
        const Δλ = ((p2.longitude - p1.longitude) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        total_distance += R * c;
    }

    const routeData = {
        name: path.basename(absolutePath, '.gpx'),
        description: '',
        path: routePath,
        total_distance: parseFloat(total_distance.toFixed(2)),
        owner_id: 'PLACEHOLDER_USER_ID',
        created_by: 'PLACEHOLDER_USER_ID',
    };

    console.log(JSON.stringify(routeData, null, 2));
    console.error(`\nSuccessfully converted ${routePath.length} points.`);
    console.error(`Total distance: ${total_distance.toFixed(2)}m`);
  }
} catch (error) {
  console.error('Error processing GPX file:', error);
  process.exit(1);
}
