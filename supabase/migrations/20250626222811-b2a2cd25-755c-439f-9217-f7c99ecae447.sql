
-- Primeiro, remover as políticas RLS que dependem da coluna conversation_id
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON public.messages;

-- Remover a função existente antes de alterar o tipo da coluna
DROP FUNCTION IF EXISTS public.get_conversation_number(uuid);

-- Alterar a coluna conversation_id de integer para bigint
ALTER TABLE public.messages ALTER COLUMN conversation_id TYPE bigint;

-- Recriar a função get_conversation_number para retornar bigint
CREATE OR REPLACE FUNCTION public.get_conversation_number(conversation_uuid uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT abs(hashtext(conversation_uuid::text))::bigint;
$$;

-- Recriar as políticas RLS com o novo tipo bigint
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
