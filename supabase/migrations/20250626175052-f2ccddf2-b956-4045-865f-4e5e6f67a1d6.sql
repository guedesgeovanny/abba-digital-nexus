
-- Primeiro, vamos criar uma função para inserir dados de exemplo que será executada quando um usuário estiver logado
CREATE OR REPLACE FUNCTION public.create_sample_conversations()
RETURNS void AS $$
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
    
    -- Verificar se já existem conversas para este usuário
    IF EXISTS (SELECT 1 FROM public.conversations WHERE user_id = current_user_id) THEN
        RAISE NOTICE 'Sample conversations already exist for this user';
        RETURN;
    END IF;
    
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
    
    -- Inserir mensagens para cada conversa
    -- Mensagens para Maria Silva
    INSERT INTO public.messages (conversation_id, content, direction, message_type, sender_name, created_at) VALUES
    (conv1_id, 'Olá! Como posso ajudá-la?', 'sent', 'text', 'Você', now() - interval '10 minutes'),
    (conv1_id, 'Olá! Gostaria de saber mais sobre os serviços', 'received', 'text', 'Maria Silva', now() - interval '5 minutes'),
    (conv1_id, 'Vocês trabalham com que tipo de projeto?', 'received', 'text', 'Maria Silva', now() - interval '3 minutes');
    
    -- Mensagens para João Santos
    INSERT INTO public.messages (conversation_id, content, direction, message_type, sender_name, created_at) VALUES
    (conv2_id, 'Olá João! Obrigado pelo interesse!', 'sent', 'text', 'Você', now() - interval '2 hours'),
    (conv2_id, 'Vi sua postagem no Instagram, muito interessante!', 'received', 'text', 'João Santos', now() - interval '1 hour'),
    (conv2_id, 'Gostaria de marcar uma reunião', 'received', 'text', 'João Santos', now() - interval '45 minutes');
    
    -- Mensagens para Ana Costa
    INSERT INTO public.messages (conversation_id, content, direction, message_type, sender_name, created_at) VALUES
    (conv3_id, 'Bom dia Ana! Em que posso ajudar?', 'sent', 'text', 'Você', now() - interval '3 days'),
    (conv3_id, 'Preciso de uma proposta para meu projeto', 'received', 'text', 'Ana Costa', now() - interval '2 days 12 hours'),
    (conv3_id, 'Claro! Vou preparar uma proposta personalizada', 'sent', 'text', 'Você', now() - interval '2 days 8 hours'),
    (conv3_id, 'Obrigada pelo atendimento!', 'received', 'text', 'Ana Costa', now() - interval '2 days');
    
    -- Mensagens para Pedro Oliveira
    INSERT INTO public.messages (conversation_id, content, direction, message_type, sender_name, created_at) VALUES
    (conv4_id, 'Olá Pedro! Como posso ajudar?', 'sent', 'text', 'Você', now() - interval '1 hour'),
    (conv4_id, 'Preciso de uma cotação urgente', 'received', 'text', 'Pedro Oliveira', now() - interval '30 minutes'),
    (conv4_id, 'É para quando?', 'received', 'text', 'Pedro Oliveira', now() - interval '25 minutes'),
    (conv4_id, 'Para amanhã se possível', 'received', 'text', 'Pedro Oliveira', now() - interval '20 minutes');
    
    -- Mensagens para Carla Mendes
    INSERT INTO public.messages (conversation_id, content, direction, message_type, sender_name, created_at) VALUES
    (conv5_id, 'Olá Carla! Nosso horário é das 8h às 18h', 'sent', 'text', 'Você', now() - interval '3 hours'),
    (conv5_id, 'Quando vocês abrem amanhã?', 'received', 'text', 'Carla Mendes', now() - interval '2 hours'),
    (conv5_id, 'Perfeito, obrigada!', 'received', 'text', 'Carla Mendes', now() - interval '1 hour 45 minutes');
    
    RAISE NOTICE 'Sample conversations and messages created successfully for user %', current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
