-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create routes table (The definition of a course/route)
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'Nova Rota',
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    path JSONB NOT NULL DEFAULT '[]'::jsonb, -- The planned path geometry
    total_distance NUMERIC(10, 2) CHECK (total_distance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create runs table (The user's activity history)
CREATE TABLE IF NOT EXISTS public.runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL, -- Link to the route definition if applicable
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration INTEGER CHECK (duration >= 0), -- in seconds
    distance NUMERIC(10, 2) CHECK (distance >= 0), -- in meters
    path JSONB NOT NULL DEFAULT '[]'::jsonb, -- The actual path recorded participating in this run
    territory_ids TEXT[] DEFAULT ARRAY[]::text[], -- Captured territories
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    metadata JSONB DEFAULT '{}'::jsonb -- For additional data like elevation, average speed, etc.
);

-- Create indexes for better query performance
-- Indexes for runs
CREATE INDEX IF NOT EXISTS idx_runs_user_id ON public.runs(user_id);
CREATE INDEX IF NOT EXISTS idx_runs_route_id ON public.runs(route_id);
CREATE INDEX IF NOT EXISTS idx_runs_created_at ON public.runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_runs_status ON public.runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_path_gin ON public.runs USING GIN(path);

-- Indexes for routes
CREATE INDEX IF NOT EXISTS idx_routes_created_by ON public.routes(created_by);
CREATE INDEX IF NOT EXISTS idx_routes_owner_id ON public.routes(owner_id);
CREATE INDEX IF NOT EXISTS idx_routes_created_at ON public.routes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_routes_path_gin ON public.routes USING GIN(path);

-- Enable Row Level Security
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policies for RUNS (User specific data)

-- Policy: Users can view only their own runs
CREATE POLICY "Users can view their own runs"
    ON public.runs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create their own runs
CREATE POLICY "Users can create their own runs"
    ON public.runs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own runs
CREATE POLICY "Users can update their own runs"
    ON public.runs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own runs
CREATE POLICY "Users can delete their own runs"
    ON public.runs
    FOR DELETE
    USING (auth.uid() = user_id);


-- Policies for ROUTES (Shared or Public definitions)

-- Policy: Authenticated users can view all routes
CREATE POLICY "Authenticated users can view routes"
    ON public.routes
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can create routes
CREATE POLICY "Authenticated users can create routes"
    ON public.routes
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: Owners can update their routes
CREATE POLICY "Owners can update their routes"
    ON public.routes
    FOR UPDATE
    USING (auth.uid() = owner_id);

-- Policy: Owners can delete their routes
CREATE POLICY "Owners can delete their routes"
    ON public.routes
    FOR DELETE
    USING (auth.uid() = owner_id);

-- Add comments for documentation
COMMENT ON TABLE public.routes IS 'Stores defined running routes/courses independent of specific user runs.';
COMMENT ON TABLE public.runs IS 'Stores user running history/activities, potentially linked to a route.';
COMMENT ON COLUMN public.routes.path IS 'JSONB array of coordinates defining the course.';
COMMENT ON COLUMN public.runs.path IS 'JSONB array of coordinates recording the actual run.';
