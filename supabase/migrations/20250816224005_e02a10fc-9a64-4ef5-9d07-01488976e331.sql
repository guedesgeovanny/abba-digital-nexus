-- Corrigir política RLS para conexões
-- Remover a política atual e criar uma nova mais restritiva

DROP POLICY IF EXISTS "Users can view their own and assigned conexoes" ON public.conexoes;

-- Nova política: usuários só podem ver conexões atribuídas a eles ou se forem admin
CREATE POLICY "Users can view assigned conexoes and admins see all" 
ON public.conexoes 
FOR SELECT 
USING (
  -- Admins podem ver todas
  (get_current_user_role() = 'admin'::text) 
  OR 
  -- Usuários não-admin só podem ver conexões atribuídas a eles
  ((auth.uid())::text IN (SELECT jsonb_array_elements_text(conexoes.assigned_users)))
);

-- Política para permitir que usuários criem suas próprias conexões (mantém a mesma)
-- Política para permitir que usuários atualizem suas próprias conexões (mantém a mesma)  
-- Política para permitir que usuários deletem suas próprias conexões (mantém a mesma)
-- Política para permitir que admins atualizem atribuições (mantém a mesma)