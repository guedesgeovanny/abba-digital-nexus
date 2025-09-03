-- Otimizações de performance para o banco de dados

-- 1. Índices otimizados para a tabela profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email_not_null ON public.profiles (email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles (role, status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc ON public.profiles (created_at DESC);

-- 2. Índices para conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_assigned ON public.conversations (user_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at_desc ON public.conversations (last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_conversations_status_channel ON public.conversations (status, channel);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON public.conversations (contact_id) WHERE contact_id IS NOT NULL;

-- 3. Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_conversa_created_at ON public.messages (conversa_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_direcao_created_at ON public.messages (direcao, created_at) WHERE direcao = 'received';

-- 4. Índices para conversation_read_status
CREATE INDEX IF NOT EXISTS idx_conversation_read_status_user_conv ON public.conversation_read_status (user_id, conversation_id);

-- 5. Função otimizada para buscar conversas com melhor performance
CREATE OR REPLACE FUNCTION public.get_conversations_optimized(
  user_id_param uuid, 
  is_admin_param boolean DEFAULT false,
  limit_param integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  contact_id uuid,
  contact_name text,
  contact_phone text,
  contact_username text,
  contact_avatar text,
  status text,
  channel text,
  last_message text,
  last_message_at timestamp with time zone,
  unread_count bigint,
  assigned_to uuid,
  crm_stage text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    -- Subconsulta otimizada para contar mensagens não lidas
    COALESCE(
      (SELECT COUNT(*)::BIGINT 
       FROM messages m 
       WHERE m.conversa_id = c.id 
       AND m.direcao = 'received'
       AND m.created_at > COALESCE(
         (SELECT crs.last_read_at 
          FROM conversation_read_status crs 
          WHERE crs.conversation_id = c.id 
          AND crs.user_id = user_id_param
          LIMIT 1), 
         '1970-01-01'::timestamp with time zone
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
    CASE WHEN c.last_message_at IS NOT NULL THEN c.last_message_at ELSE c.created_at END DESC
  LIMIT limit_param;
END;
$$;

-- 6. Função para limpeza de cache/dados antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cleaned_count integer := 0;
BEGIN
  -- Limpar rate_limits expirados
  DELETE FROM public.rate_limits WHERE expires_at < now() - interval '1 day';
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- Limpar logs de segurança muito antigos (mais de 90 dias)
  DELETE FROM public.security_audit_logs WHERE created_at < now() - interval '90 days';
  
  RETURN cleaned_count;
END;
$$;

-- 7. Configurações de performance para queries
ALTER FUNCTION public.get_user_profile_fast(uuid) SET work_mem = '16MB';
ALTER FUNCTION public.get_conversations_optimized(uuid, boolean, integer) SET work_mem = '32MB';

-- 8. Atualizar estatísticas das tabelas principais
ANALYZE public.profiles;
ANALYZE public.conversations;
ANALYZE public.messages;
ANALYZE public.conversation_read_status;