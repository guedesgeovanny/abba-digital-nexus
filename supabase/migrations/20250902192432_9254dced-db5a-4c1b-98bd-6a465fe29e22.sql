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