-- Corrigir definitivamente a política RLS usando @> operator
DROP POLICY IF EXISTS "Users can view assigned conexoes and admins see all" ON public.conexoes;

-- Política corrigida usando o operador @> para verificar se o array contém o user_id
CREATE POLICY "Users can view assigned conexoes and admins see all" 
ON public.conexoes 
FOR SELECT 
USING (
  -- Admins podem ver todas
  (get_current_user_role() = 'admin'::text) 
  OR 
  -- Usuários não-admin só podem ver conexões onde seu ID está no array assigned_users
  (assigned_users @> jsonb_build_array((auth.uid())::text))
);