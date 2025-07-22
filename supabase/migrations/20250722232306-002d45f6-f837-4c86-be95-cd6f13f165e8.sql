
-- Adicionar coluna assigned_to na tabela conversations
ALTER TABLE public.conversations 
ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_conversations_assigned_to ON public.conversations(assigned_to);

-- Atualizar políticas RLS para permitir que usuários vejam conversas atribuídas a eles
-- Admins podem ver todas as conversas
-- Outros usuários podem ver conversas que criaram OU que foram atribuídas a eles
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations and assigned ones" 
    ON public.conversations 
    FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        auth.uid() = assigned_to OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Política para atribuição: apenas admins e editors podem atribuir conversas
CREATE POLICY "Admins and editors can assign conversations" 
    ON public.conversations 
    FOR UPDATE 
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor')
    );
