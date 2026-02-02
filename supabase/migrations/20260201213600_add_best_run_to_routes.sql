-- Add best_run_id to routes table
ALTER TABLE public.routes
ADD COLUMN best_run_id UUID REFERENCES public.runs(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_routes_best_run_id ON public.routes(best_run_id);

-- Comment
COMMENT ON COLUMN public.routes.best_run_id IS 'Reference to the run that currently holds the record for this route.';
