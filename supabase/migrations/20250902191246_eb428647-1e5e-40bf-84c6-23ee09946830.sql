-- Create the optimized conversations RPC function
CREATE OR REPLACE FUNCTION public.get_optimized_conversations(
  user_id_param UUID,
  is_admin_param BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  contact_id UUID,
  contact_name TEXT,
  contact_phone TEXT,
  contact_username TEXT,
  contact_avatar TEXT,
  status TEXT,
  channel TEXT,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT,
  assigned_to UUID,
  crm_stage TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.contact_id,
    c.contact_name,
    c.contact_phone,
    c.contact_username,
    c.contact_avatar,
    c.status,
    c.channel,
    c.last_message,
    c.last_message_at,
    COALESCE(
      (SELECT COUNT(*)::BIGINT 
       FROM messages m 
       WHERE m.conversa_id = c.id 
       AND m.direcao = 'received'
       AND NOT EXISTS (
         SELECT 1 FROM conversation_read_status crs 
         WHERE crs.conversation_id = c.id 
         AND crs.user_id = user_id_param
         AND crs.last_read_at >= m.created_at
       )
      ), 0
    ) as unread_count,
    c.assigned_to,
    c.crm_stage,
    c.created_at,
    c.updated_at
  FROM conversations c
  WHERE 
    CASE 
      WHEN is_admin_param THEN true
      ELSE c.user_id = user_id_param OR c.assigned_to = user_id_param OR c.assigned_to IS NULL
    END
  ORDER BY 
    CASE WHEN c.last_message_at IS NOT NULL THEN c.last_message_at ELSE c.created_at END DESC;
END;
$$;