-- Critical Security Fix: Update database functions with proper security settings

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER 
SET search_path = ''
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

-- Fix get_conversation_number function  
CREATE OR REPLACE FUNCTION public.get_conversation_number(conversation_uuid uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT abs(hashtext(conversation_uuid::text))::bigint;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'viewer',  -- role padrão
    'pending'  -- status padrão (inativo até admin aprovar)
  );
  RETURN NEW;
END;
$function$;

-- Fix create_sample_conversations function
CREATE OR REPLACE FUNCTION public.create_sample_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    current_user_id uuid;
    conv1_id uuid;
    conv2_id uuid;
    conv3_id uuid;
    conv4_id uuid;
    conv5_id uuid;
BEGIN
    -- Verificar se há um usuário logado
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to create sample conversations';
    END IF;
    
    -- Limpar conversas existentes do usuário
    DELETE FROM public.conversations WHERE user_id = current_user_id;
    
    -- Inserir conversas de exemplo
    INSERT INTO public.conversations (user_id, contact_name, contact_phone, contact_username, contact_avatar, status, channel, last_message, last_message_at, unread_count) VALUES
    (current_user_id, 'Maria Silva', '+5511999887766', 'maria_silva', 'https://i.pravatar.cc/150?img=1', 'aberta', 'whatsapp', 'Olá! Gostaria de saber mais sobre os serviços', now() - interval '5 minutes', 2),
    (current_user_id, 'João Santos', null, '@joao_santos', 'https://i.pravatar.cc/150?img=2', 'aberta', 'instagram', 'Vi sua postagem no Instagram, muito interessante!', now() - interval '1 hour', 1),
    (current_user_id, 'Ana Costa', '+5511888776655', 'ana_costa', 'https://i.pravatar.cc/150?img=3', 'fechada', 'whatsapp', 'Obrigada pelo atendimento!', now() - interval '2 days', 0),
    (current_user_id, 'Pedro Oliveira', null, 'pedro.oliveira', 'https://i.pravatar.cc/150?img=4', 'aberta', 'messenger', 'Preciso de uma cotação urgente', now() - interval '30 minutes', 3),
    (current_user_id, 'Carla Mendes', '+5511777665544', 'carla_mendes', 'https://i.pravatar.cc/150?img=5', 'aberta', 'whatsapp', 'Quando vocês abrem amanhã?', now() - interval '2 hours', 1)
    RETURNING id INTO conv1_id, conv2_id, conv3_id, conv4_id, conv5_id;
    
    -- Obter os IDs das conversas criadas
    SELECT id INTO conv1_id FROM public.conversations WHERE user_id = current_user_id AND contact_name = 'Maria Silva';
    SELECT id INTO conv2_id FROM public.conversations WHERE user_id = current_user_id AND contact_name = 'João Santos';
    SELECT id INTO conv3_id FROM public.conversations WHERE user_id = current_user_id AND contact_name = 'Ana Costa';
    SELECT id INTO conv4_id FROM public.conversations WHERE user_id = current_user_id AND contact_name = 'Pedro Oliveira';
    SELECT id INTO conv5_id FROM public.conversations WHERE user_id = current_user_id AND contact_name = 'Carla Mendes';
    
    -- Inserir mensagens para cada conversa usando a nova estrutura
    -- Mensagens para Maria Silva
    INSERT INTO public.messages (conversa_id, mensagem, direcao, nome_contato, data_hora, created_at) VALUES
    (conv1_id, 'Olá! Como posso ajudá-la?', 'sent', 'Você', now() - interval '10 minutes', now() - interval '10 minutes'),
    (conv1_id, 'Olá! Gostaria de saber mais sobre os serviços', 'received', 'Maria Silva', now() - interval '5 minutes', now() - interval '5 minutes'),
    (conv1_id, 'Vocês trabalham com que tipo de projeto?', 'received', 'Maria Silva', now() - interval '3 minutes', now() - interval '3 minutes');
    
    -- Mensagens para João Santos
    INSERT INTO public.messages (conversa_id, mensagem, direcao, nome_contato, data_hora, created_at) VALUES
    (conv2_id, 'Olá João! Obrigado pelo interesse!', 'sent', 'Você', now() - interval '2 hours', now() - interval '2 hours'),
    (conv2_id, 'Vi sua postagem no Instagram, muito interessante!', 'received', 'João Santos', now() - interval '1 hour', now() - interval '1 hour'),
    (conv2_id, 'Gostaria de marcar uma reunião', 'received', 'João Santos', now() - interval '45 minutes', now() - interval '45 minutes');
    
    -- Mensagens para Ana Costa
    INSERT INTO public.messages (conversa_id, mensagem, direcao, nome_contato, data_hora, created_at) VALUES
    (conv3_id, 'Bom dia Ana! Em que posso ajudar?', 'sent', 'Você', now() - interval '3 days', now() - interval '3 days'),
    (conv3_id, 'Preciso de uma proposta para meu projeto', 'received', 'Ana Costa', now() - interval '2 days 12 hours', now() - interval '2 days 12 hours'),
    (conv3_id, 'Claro! Vou preparar uma proposta personalizada', 'sent', 'Você', now() - interval '2 days 8 hours', now() - interval '2 days 8 hours'),
    (conv3_id, 'Obrigada pelo atendimento!', 'received', 'Ana Costa', now() - interval '2 days', now() - interval '2 days');
    
    -- Mensagens para Pedro Oliveira
    INSERT INTO public.messages (conversa_id, mensagem, direcao, nome_contato, data_hora, created_at) VALUES
    (conv4_id, 'Olá Pedro! Como posso ajudar?', 'sent', 'Você', now() - interval '1 hour', now() - interval '1 hour'),
    (conv4_id, 'Preciso de uma cotação urgente', 'received', 'Pedro Oliveira', now() - interval '30 minutes', now() - interval '30 minutes'),
    (conv4_id, 'É para quando?', 'received', 'Pedro Oliveira', now() - interval '25 minutes', now() - interval '25 minutes'),
    (conv4_id, 'Para amanhã se possível', 'received', 'Pedro Oliveira', now() - interval '20 minutes', now() - interval '20 minutes');
    
    -- Mensagens para Carla Mendes
    INSERT INTO public.messages (conversa_id, mensagem, direcao, nome_contato, data_hora, created_at) VALUES
    (conv5_id, 'Olá Carla! Nosso horário é das 8h às 18h', 'sent', 'Você', now() - interval '3 hours', now() - interval '3 hours'),
    (conv5_id, 'Quando vocês abrem amanhã?', 'received', 'Carla Mendes', now() - interval '2 hours', now() - interval '2 hours'),
    (conv5_id, 'Perfeito, obrigada!', 'received', 'Carla Mendes', now() - interval '1 hour 45 minutes', now() - interval '1 hour 45 minutes');
    
    RAISE NOTICE 'Sample conversations and messages created successfully for user %', current_user_id;
END;
$function$;

-- Security Fix: Prevent privilege escalation - Users cannot update their own role
-- Drop existing policy and recreate with proper restrictions
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile except role" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Prevent role changes
);

-- Ensure only admins can update roles
CREATE POLICY "Admins can update profile roles" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');