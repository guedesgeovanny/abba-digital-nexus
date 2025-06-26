
-- Inserir conversas de exemplo usando a função que criamos anteriormente
-- Esta migração será executada automaticamente quando o banco for atualizado

DO $$
DECLARE
    user_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se existe pelo menos um usuário autenticado
    SELECT EXISTS(SELECT 1 FROM auth.users LIMIT 1) INTO user_exists;
    
    -- Se não há usuários, não fazemos nada
    IF NOT user_exists THEN
        RAISE NOTICE 'No users found. Sample conversations will be created when users sign up.';
        RETURN;
    END IF;
    
    -- Para cada usuário existente, criar conversas de exemplo se ainda não existirem
    FOR user_record IN SELECT id FROM auth.users LOOP
        -- Verificar se o usuário já tem conversas
        IF NOT EXISTS (SELECT 1 FROM public.conversations WHERE user_id = user_record.id) THEN
            -- Inserir conversas de exemplo para este usuário
            INSERT INTO public.conversations (user_id, contact_name, contact_phone, contact_username, contact_avatar, status, channel, last_message, last_message_at, unread_count) VALUES
            (user_record.id, 'Maria Silva', '+5511999887766', 'maria_silva', 'https://i.pravatar.cc/150?img=1', 'aberta', 'whatsapp', 'Olá! Gostaria de saber mais sobre os serviços', now() - interval '5 minutes', 2),
            (user_record.id, 'João Santos', null, '@joao_santos', 'https://i.pravatar.cc/150?img=2', 'aberta', 'instagram', 'Vi sua postagem no Instagram, muito interessante!', now() - interval '1 hour', 1),
            (user_record.id, 'Ana Costa', '+5511888776655', 'ana_costa', 'https://i.pravatar.cc/150?img=3', 'fechada', 'whatsapp', 'Obrigada pelo atendimento!', now() - interval '2 days', 0),
            (user_record.id, 'Pedro Oliveira', null, 'pedro.oliveira', 'https://i.pravatar.cc/150?img=4', 'aberta', 'messenger', 'Preciso de uma cotação urgente', now() - interval '30 minutes', 3),
            (user_record.id, 'Carla Mendes', '+5511777665544', 'carla_mendes', 'https://i.pravatar.cc/150?img=5', 'aberta', 'whatsapp', 'Quando vocês abrem amanhã?', now() - interval '2 hours', 1);
            
            -- Inserir mensagens para as conversas criadas
            -- Mensagens para Maria Silva
            INSERT INTO public.messages (conversation_id, content, direction, message_type, sender_name, created_at) 
            SELECT c.id, m.content, m.direction, m.message_type, m.sender_name, m.created_at
            FROM public.conversations c,
            (VALUES 
                ('Olá! Como posso ajudá-la?', 'sent', 'text', 'Você', now() - interval '10 minutes'),
                ('Olá! Gostaria de saber mais sobre os serviços', 'received', 'text', 'Maria Silva', now() - interval '5 minutes'),
                ('Vocês trabalham com que tipo de projeto?', 'received', 'text', 'Maria Silva', now() - interval '3 minutes')
            ) AS m(content, direction, message_type, sender_name, created_at)
            WHERE c.user_id = user_record.id AND c.contact_name = 'Maria Silva';
            
            -- Mensagens para João Santos
            INSERT INTO public.messages (conversation_id, content, direction, message_type, sender_name, created_at) 
            SELECT c.id, m.content, m.direction, m.message_type, m.sender_name, m.created_at
            FROM public.conversations c,
            (VALUES 
                ('Olá João! Obrigado pelo interesse!', 'sent', 'text', 'Você', now() - interval '2 hours'),
                ('Vi sua postagem no Instagram, muito interessante!', 'received', 'text', 'João Santos', now() - interval '1 hour'),
                ('Gostaria de marcar uma reunião', 'received', 'text', 'João Santos', now() - interval '45 minutes')
            ) AS m(content, direction, message_type, sender_name, created_at)
            WHERE c.user_id = user_record.id AND c.contact_name = 'João Santos';
            
            -- Mensagens para Ana Costa
            INSERT INTO public.messages (conversation_id, content, direction, message_type, sender_name, created_at) 
            SELECT c.id, m.content, m.direction, m.message_type, m.sender_name, m.created_at
            FROM public.conversations c,
            (VALUES 
                ('Bom dia Ana! Em que posso ajudar?', 'sent', 'text', 'Você', now() - interval '3 days'),
                ('Preciso de uma proposta para meu projeto', 'received', 'text', 'Ana Costa', now() - interval '2 days 12 hours'),
                ('Claro! Vou preparar uma proposta personalizada', 'sent', 'text', 'Você', now() - interval '2 days 8 hours'),
                ('Obrigada pelo atendimento!', 'received', 'text', 'Ana Costa', now() - interval '2 days')
            ) AS m(content, direction, message_type, sender_name, created_at)
            WHERE c.user_id = user_record.id AND c.contact_name = 'Ana Costa';
            
            -- Mensagens para Pedro Oliveira
            INSERT INTO public.messages (conversation_id, content, direction, message_type, sender_name, created_at) 
            SELECT c.id, m.content, m.direction, m.message_type, m.sender_name, m.created_at
            FROM public.conversations c,
            (VALUES 
                ('Olá Pedro! Como posso ajudar?', 'sent', 'text', 'Você', now() - interval '1 hour'),
                ('Preciso de uma cotação urgente', 'received', 'text', 'Pedro Oliveira', now() - interval '30 minutes'),
                ('É para quando?', 'received', 'text', 'Pedro Oliveira', now() - interval '25 minutes'),
                ('Para amanhã se possível', 'received', 'text', 'Pedro Oliveira', now() - interval '20 minutes')
            ) AS m(content, direction, message_type, sender_name, created_at)
            WHERE c.user_id = user_record.id AND c.contact_name = 'Pedro Oliveira';
            
            -- Mensagens para Carla Mendes
            INSERT INTO public.messages (conversation_id, content, direction, message_type, sender_name, created_at) 
            SELECT c.id, m.content, m.direction, m.message_type, m.sender_name, m.created_at
            FROM public.conversations c,
            (VALUES 
                ('Olá Carla! Nosso horário é das 8h às 18h', 'sent', 'text', 'Você', now() - interval '3 hours'),
                ('Quando vocês abrem amanhã?', 'received', 'text', 'Carla Mendes', now() - interval '2 hours'),
                ('Perfeito, obrigada!', 'received', 'text', 'Carla Mendes', now() - interval '1 hour 45 minutes')
            ) AS m(content, direction, message_type, sender_name, created_at)
            WHERE c.user_id = user_record.id AND c.contact_name = 'Carla Mendes';
            
            RAISE NOTICE 'Sample conversations created for user %', user_record.id;
        ELSE
            RAISE NOTICE 'User % already has conversations', user_record.id;
        END IF;
    END LOOP;
END $$;
