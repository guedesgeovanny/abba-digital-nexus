-- Remove agents feature tables and function
BEGIN;

-- Drop helper function if exists
DROP FUNCTION IF EXISTS public.create_agent_metrics() CASCADE;

-- Drop dependent table first
DROP TABLE IF EXISTS public.agent_metrics CASCADE;

-- Drop main agents table
DROP TABLE IF EXISTS public.agents CASCADE;

COMMIT;