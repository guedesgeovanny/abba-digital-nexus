-- Corrigir políticas RLS da tabela conversations para permitir que usuários atualizem suas conversas
-- Remove as políticas conflitantes de UPDATE
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins and editors can assign conversations" ON public.conversations;

-- Criar uma política unificada de UPDATE que permite:
-- 1. Usuários atualizarem suas próprias conversas
-- 2. Usuários atualizarem conversas atribuídas a eles
-- 3. Admins e editores atualizarem qualquer conversa (incluindo atribuições)
CREATE POLICY "Users can update accessible conversations" 
ON public.conversations 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() = assigned_to) OR 
  (get_current_user_role() = ANY(ARRAY['admin', 'editor']))
);