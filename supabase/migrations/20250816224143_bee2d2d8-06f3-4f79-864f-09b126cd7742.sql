-- Verificar e corrigir a política RLS
-- Remover a política atual que ainda não está funcionando corretamente
DROP POLICY IF EXISTS "Users can view assigned conexoes and admins see all" ON public.conexoes;

-- Criar política corrigida que usa a sintaxe correta do PostgreSQL
CREATE POLICY "Users can view assigned conexoes and admins see all" 
ON public.conexoes 
FOR SELECT 
USING (
  -- Admins podem ver todas
  (get_current_user_role() = 'admin'::text) 
  OR 
  -- Usuários não-admin só podem ver conexões onde estão na lista assigned_users
  (assigned_users ? (auth.uid())::text)
);