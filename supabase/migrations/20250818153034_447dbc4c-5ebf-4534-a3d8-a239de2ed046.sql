-- Corrigir políticas RLS da tabela contacts para permitir que usuários atualizem contatos de conversas atribuídas
-- Remove a política de UPDATE existente
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;

-- Criar uma política unificada de UPDATE que permite:
-- 1. Usuários atualizarem seus próprios contatos
-- 2. Usuários atualizarem contatos de conversas atribuídas a eles
-- 3. Admins atualizarem qualquer contato
CREATE POLICY "Users can update accessible contacts" 
ON public.contacts 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (get_current_user_role() = 'admin') OR 
  (EXISTS (
    SELECT 1 
    FROM conversations 
    WHERE conversations.contact_id = contacts.id 
    AND conversations.assigned_to = auth.uid()
  ))
);