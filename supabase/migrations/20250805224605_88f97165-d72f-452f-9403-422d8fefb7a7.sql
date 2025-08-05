-- Limpeza de dados de teste e configuração adequada

-- 1. Remover agentes de exemplo com IDs fixos que podem estar interferindo
DELETE FROM public.agents 
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003'
);

-- 2. Remover tags de exemplo que podem estar interferindo  
DELETE FROM public.contact_tags
WHERE name IN ('Urgente', 'VIP', 'Prospecção', 'Qualificado', 'Hot Lead');

-- 3. Limpar conversas de teste que podem estar usando IDs fixos
DELETE FROM public.conversations 
WHERE contact_name IN ('Maria Silva', 'João Santos', 'Ana Costa', 'Pedro Oliveira', 'Carla Mendes');

-- 4. Limpar mensagens órfãs (sem conversa válida)
DELETE FROM public.messages 
WHERE conversa_id NOT IN (SELECT id FROM public.conversations);

-- 5. Atualizar configuração padrão dos agentes para garantir estrutura consistente
UPDATE public.agents 
SET configuration = jsonb_build_object(
  'connection_status', 'disconnected',
  'evolution_api_key', null,
  'evolution_instance_name', null,
  'last_connection_check', null
)
WHERE configuration IS NULL OR configuration = '{}';

-- 6. Garantir que campos WhatsApp sejam NULL para agentes não conectados
UPDATE public.agents 
SET 
  whatsapp_profile_name = NULL,
  whatsapp_contact = NULL,
  whatsapp_profile_picture_url = NULL,
  whatsapp_profile_picture_data = NULL,
  whatsapp_connected_at = NULL
WHERE status != 'active' OR (configuration->>'connection_status') != 'connected';