
-- Remover as políticas RLS existentes que dependem dos nomes das colunas
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON public.messages;

-- Remover o índice existente
DROP INDEX IF EXISTS idx_messages_conversation_id_created_at;

-- Reestruturar a tabela messages
-- Primeiro, adicionar as novas colunas
ALTER TABLE public.messages ADD COLUMN numero BIGSERIAL;
ALTER TABLE public.messages ADD COLUMN data_hora TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Renomear as colunas existentes
ALTER TABLE public.messages RENAME COLUMN content TO mensagem;
ALTER TABLE public.messages RENAME COLUMN direction TO direcao;
ALTER TABLE public.messages RENAME COLUMN conversation_id TO conversa_id;
ALTER TABLE public.messages RENAME COLUMN sender_name TO nome_contato;

-- Remover colunas não necessárias
ALTER TABLE public.messages DROP COLUMN IF EXISTS message_type;
ALTER TABLE public.messages DROP COLUMN IF EXISTS read_at;

-- Remover a chave primária antiga e definir numero como nova chave primária
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE public.messages DROP COLUMN IF EXISTS id;
ALTER TABLE public.messages ADD PRIMARY KEY (numero);

-- Recriar a foreign key constraint com o novo nome da coluna
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE public.messages 
ADD CONSTRAINT messages_conversa_id_fkey 
FOREIGN KEY (conversa_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Recriar as políticas RLS com os novos nomes das colunas
CREATE POLICY "Users can view messages from their conversations" 
    ON public.messages 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversa_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their conversations" 
    ON public.messages 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversa_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in their conversations" 
    ON public.messages 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversa_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages from their conversations" 
    ON public.messages 
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversa_id
            AND conversations.user_id = auth.uid()
        )
    );

-- Criar novos índices para melhor performance
CREATE INDEX idx_messages_conversa_id_data_hora ON public.messages(conversa_id, data_hora);
CREATE INDEX idx_messages_numero ON public.messages(numero);

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON public.messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Atualizar a função de criar conversas de exemplo para usar a nova estrutura
CREATE OR REPLACE FUNCTION public.create_sample_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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
