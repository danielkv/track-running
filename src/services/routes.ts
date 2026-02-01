import { supabase } from '../lib/supabase';
import { Coordinate, Run, RunStatus } from '../types/Run';

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
  }
): Promise<Run> {
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

  return updateRun(id, updates);
}
