
-- Criar enum para status das conversas
CREATE TYPE conversation_status AS ENUM ('aberta', 'fechada');

-- Criar enum para canais de comunicação
CREATE TYPE communication_channel AS ENUM ('whatsapp', 'instagram', 'messenger');

-- Criar enum para direção das mensagens
CREATE TYPE message_direction AS ENUM ('sent', 'received');

-- Criar enum para tipos de mensagem
CREATE TYPE message_type AS ENUM ('text', 'image', 'audio', 'document', 'file');

-- Criar tabela de conversas
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT,
    contact_username TEXT,
    contact_avatar TEXT,
    status conversation_status NOT NULL DEFAULT 'aberta',
    channel communication_channel,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    unread_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de mensagens
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    direction message_direction NOT NULL,
    message_type message_type NOT NULL DEFAULT 'text',
    sender_name TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conversas
CREATE POLICY "Users can view their own conversations" 
    ON public.conversations 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
    ON public.conversations 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
    ON public.conversations 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
    ON public.conversations 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Políticas RLS para mensagens (através da conversa)
CREATE POLICY "Users can view messages from their conversations" 
    ON public.messages 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their conversations" 
    ON public.messages 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in their conversations" 
    ON public.messages 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages from their conversations" 
    ON public.messages 
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.user_id = auth.uid()
        )
    );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON public.conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_channel ON public.conversations(channel);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
