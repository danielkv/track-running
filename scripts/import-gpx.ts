import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const DEFAULT_USER_ID = process.env.IMPORT_USER_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON_KEY) must be set in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const targetPath = process.argv[2];

if (!targetPath) {
  console.error('Usage: yarn import-gpx <path-to-file-or-directory>');
  process.exit(1);
}

async function parseGPX(filePath: string) {
  const gpxContent = fs.readFileSync(filePath, 'utf-8');
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

  if (routePath.length === 0) return null;

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

  return {
    name: path.basename(filePath, '.gpx'),
    path: routePath,
    total_distance: parseFloat(total_distance.toFixed(2)),
  };
}

async function importFile(filePath: string) {
  if (!filePath.toLowerCase().endsWith('.gpx')) return;

  console.log(`Processing: ${filePath}...`);
  const routeData = await parseGPX(filePath);

  if (!routeData) {
    console.warn(`No valid points found in ${filePath}, skipping.`);
    return;
  }

  if (!DEFAULT_USER_ID) {
    console.error('Error: IMPORT_USER_ID must be set in .env to identify the route owner.');
    process.exit(1);
  }

  const { data, error } = await supabase
    .from('routes')
    .insert({
      name: routeData.name,
      path: routeData.path,
      total_distance: routeData.total_distance,
      owner_id: DEFAULT_USER_ID,
      created_by: DEFAULT_USER_ID,
      description: `Imported from ${path.basename(filePath)}`,
    })
    .select();

  if (error) {
    console.error(`Failed to import ${filePath}:`, error.message);
  } else {
    console.log(`Successfully imported: ${routeData.name} (ID: ${data[0].id})`);
  }
}

async function run() {
  const absolutePath = path.resolve(process.cwd(), targetPath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`Path not found: ${absolutePath}`);
    process.exit(1);
  }

  const stats = fs.statSync(absolutePath);

  if (stats.isFile()) {
    await importFile(absolutePath);
  } else if (stats.isDirectory()) {
    const files = fs.readdirSync(absolutePath);
    for (const file of files) {
      await importFile(path.join(absolutePath, file));
    }
  }

  console.log('Done.');
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
