-- Adicionar política para permitir que admins deletem usuários
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (get_current_user_role() = 'admin');