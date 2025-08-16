-- Security Enhancement Migration
-- Create table for security audit logs
CREATE TABLE public.security_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'failed_login', 'password_change', 'profile_update', 'permission_change')),
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security_audit_logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for security_audit_logs
CREATE POLICY "Admins can view all security logs" 
ON public.security_audit_logs 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own security logs" 
ON public.security_audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create security logs" 
ON public.security_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create table for rate limiting
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address or user ID
  action TEXT NOT NULL, -- login, api_call, etc.
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for rate limiting queries
CREATE INDEX idx_rate_limits_identifier_action ON public.rate_limits(identifier, action);
CREATE INDEX idx_rate_limits_expires_at ON public.rate_limits(expires_at);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policies for rate_limits (admin only)
CREATE POLICY "Admins can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id,
    event_type,
    ip_address,
    user_agent,
    details
  ) VALUES (
    p_user_id,
    p_event_type,
    p_ip_address,
    p_user_agent,
    p_details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_limit INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start time
  window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Clean up expired entries
  DELETE FROM public.rate_limits 
  WHERE expires_at < now();
  
  -- Get current count for this identifier and action within the window
  SELECT COALESCE(SUM(count), 0) 
  INTO current_count
  FROM public.rate_limits 
  WHERE identifier = p_identifier 
    AND action = p_action 
    AND window_start >= (now() - (p_window_minutes || ' minutes')::INTERVAL);
  
  -- If under limit, increment counter
  IF current_count < p_limit THEN
    INSERT INTO public.rate_limits (
      identifier,
      action,
      count,
      expires_at
    ) VALUES (
      p_identifier,
      p_action,
      1,
      now() + (p_window_minutes || ' minutes')::INTERVAL
    )
    ON CONFLICT (identifier, action) 
    DO UPDATE SET 
      count = rate_limits.count + 1,
      updated_at = now();
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Create function to clean expired rate limits (for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Add trigger to update updated_at on rate_limits
CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();