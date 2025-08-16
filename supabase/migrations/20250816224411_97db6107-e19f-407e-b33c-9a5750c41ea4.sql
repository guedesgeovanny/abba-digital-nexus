-- Corrigir a política RLS tratando valores null da função get_current_user_role
DROP POLICY IF EXISTS "Users can view assigned conexoes and admins see all" ON public.conexoes;

-- Política final corrigida
CREATE POLICY "Users can view assigned conexoes and admins see all" 
ON public.conexoes 
FOR SELECT 
USING (
  -- Admins podem ver todas (tratando null como não-admin)
  (COALESCE(get_current_user_role(), 'viewer') = 'admin') 
  OR 
  -- Usuários não-admin só podem ver conexões onde seu ID está no array assigned_users
  (assigned_users @> jsonb_build_array((auth.uid())::text))
);