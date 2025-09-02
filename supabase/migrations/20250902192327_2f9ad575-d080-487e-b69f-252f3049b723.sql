-- Create index on profiles.id for faster lookups (it should already exist as primary key, but ensuring it's optimized)
-- Add query timeout hints and optimize the profiles table query performance
-- This is a safety migration to ensure profiles queries are fast

-- Ensure we have proper indexes for profiles table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_id_role ON public.profiles(id, role) WHERE status = 'active';

-- Add a function for faster profile lookups with timeout protection  
CREATE OR REPLACE FUNCTION public.get_user_profile_fast(user_id_param UUID)
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET statement_timeout TO '5s'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.role,
    p.status
  FROM public.profiles p
  WHERE p.id = user_id_param
  LIMIT 1;
END;
$$;