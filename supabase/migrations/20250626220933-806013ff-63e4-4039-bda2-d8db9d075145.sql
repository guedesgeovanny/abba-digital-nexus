
-- Primeiro, vamos remover as políticas RLS que dependem da coluna conversation_id
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON public.messages;

-- Desabilitar temporariamente RLS para garantir que podemos limpar todos os dados
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Limpar TODOS os dados da tabela messages
TRUNCATE TABLE public.messages;

-- Agora podemos fazer as alterações na tabela
-- Remover a chave primária e a coluna id
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE public.messages DROP COLUMN IF EXISTS id;

-- Remover a foreign key constraint se existir
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

-- Primeiro vamos criar uma nova coluna temporária para os números
ALTER TABLE public.messages ADD COLUMN conversation_number integer;

-- Copiar os dados convertendo UUID para um hash numérico
-- Como a tabela está vazia, vamos só alterar a estrutura
ALTER TABLE public.messages DROP COLUMN conversation_id;
ALTER TABLE public.messages RENAME COLUMN conversation_number TO conversation_id;

-- Tornar a coluna not null
ALTER TABLE public.messages ALTER COLUMN conversation_id SET NOT NULL;

-- Criar uma nova chave primária composta
ALTER TABLE public.messages ADD CONSTRAINT messages_pkey PRIMARY KEY (conversation_id, created_at);

-- Recriar os índices
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Reabilitar RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Criar uma função que mapeia UUIDs de conversas para números inteiros
CREATE OR REPLACE FUNCTION public.get_conversation_number(conversation_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT abs(hashtext(conversation_uuid::text));
$$;

-- Criar políticas RLS que usam a função de mapeamento
CREATE POLICY "Users can view messages from their conversations" 
    ON public.messages 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE public.get_conversation_number(conversations.id) = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their conversations" 
    ON public.messages 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE public.get_conversation_number(conversations.id) = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in their conversations" 
    ON public.messages 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE public.get_conversation_number(conversations.id) = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages from their conversations" 
    ON public.messages 
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE public.get_conversation_number(conversations.id) = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );
