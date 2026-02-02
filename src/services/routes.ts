import { supabase } from '../lib/supabase';
import { Coordinate, Route, Run, RunStatus } from '../types/Run';
import { validateRunPace } from './verification';
// ... (keep existing imports)

// ... (keep existing code)

/**
 * Create a new run
 */
export async function createRun(data: {
  startedAt: string;
  path?: Coordinate[];
}): Promise<Run> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not found');

  const { data: run, error } = await supabase
    .from('runs')
    .insert({
      user_id: user.id,
      started_at: data.startedAt,
      path: data.path || [],
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  
  return run;
}

/**
 * Update an existing run
 */
export async function updateRun(
  id: string,
  updates: Partial<Run>
): Promise<Run> {
  const { data: run, error } = await supabase
    .from('runs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  return run;
}

/**
 * Get all runs for the current user
 */
export async function getRuns(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Run[]> {
  let query = supabase
    .from('runs')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status as RunStatus);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data: runs, error } = await query;

  if (error) throw error;
  
  return runs;
}

/**
 * Get a specific run by ID
 */
export async function getRunById(id: string): Promise<Run> {
  const { data: run, error } = await supabase
    .from('runs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  
  return run;
}

/**
 * Delete a run
 */
export async function deleteRun(id: string): Promise<void> {
  const { error } = await supabase
    .from('runs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Add a coordinate to the run's path
 */
export async function addCoordinateToPath(
  id: string,
  coordinate: Coordinate
): Promise<Run> {
  // Get current run
  const run = await getRunById(id);
  
  // Add new coordinate to path
  const updatedPath = [...run.path, coordinate];
  
  // Update run
  return updateRun(id, { path: updatedPath });
}

/**
 * Complete a run (set status to completed and calculate final metrics)
 */
export async function completeRun(
  id: string,
  finalData: {
    endedAt: string;
    duration: number;
    distance: number;
    territoryIds?: string[];
    routeId?: string; // Route being run (for competition context)
  }
): Promise<Run> {
  const { valid, reason } = validateRunPace(finalData.duration, finalData.distance);
  if (!valid) {
    throw new Error(`Run rejected: ${reason}`);
  }

  // Map camelCase to snake_case for the update
  const updates: any = {
    ended_at: finalData.endedAt,
    duration: finalData.duration,
    distance: finalData.distance,
    status: 'completed',
  };

  if (finalData.territoryIds) {
    updates.territory_ids = finalData.territoryIds;
  }

  const run = await updateRun(id, updates);

  // Handle Competition Logic
  // If this run belongs to a route, check if it beats the record
  if (finalData.routeId) {
    await checkAndUpdateRouteRecord(finalData.routeId, run);
  }

  return run;
}

/**
 * Checks if a run beats the current route record and updates it if so.
 */
async function checkAndUpdateRouteRecord(routeId: string, run: Run): Promise<void> {
  try {
    const { data: route, error } = await supabase
      .from('routes')
      .select('best_run_id, owner_id')
      .eq('id', routeId)
      .single();

    if (error || !route) return;

    let isNewRecord = false;

    if (!route.best_run_id) {
      isNewRecord = true;
    } else {
      const { data: bestRun } = await supabase
        .from('runs')
        .select('duration')
        .eq('id', route.best_run_id)
        .single();
      
      // If previous best run not found or current run is faster (lower duration)
      if (!bestRun || (run.duration !== null && bestRun.duration !== null && run.duration < bestRun.duration)) {
        isNewRecord = true;
      }
    }

    if (isNewRecord) {
      await supabase
        .from('routes')
        .update({
          owner_id: run.user_id,
          best_run_id: run.id
        })
        .eq('id', routeId);
    }
  } catch (err) {
    console.warn('Failed to update route record:', err);
    // Don't fail the run completion if this fails
  }
}

/**
 * Get routes within a specific region.
 * Currently fetches ALL routes as per user request for MVP.
 */
export async function getRoutesInRegion(region: {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}): Promise<Route[]> {
  // TODO: Implement actual spatial filtering using PostGIS or client-side bounding box check if needed later.
  // For now, simple fetch of recent routes.
  
  const { data: routes, error } = await supabase
    .from('routes')
    .select('*')
    .limit(50); // Limit to avoid overwhelming map

  if (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
  
  return routes || [];
}
