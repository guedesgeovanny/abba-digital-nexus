-- Primeiro, vamos alterar a tabela custom_stages para remover a dependência do user_id
-- e tornar as stages globais para todo o sistema

-- Remover a restrição de user_id sendo obrigatório
ALTER TABLE public.custom_stages ALTER COLUMN user_id DROP NOT NULL;

-- Atualizar as políticas RLS para permitir que todos vejam as stages
-- mas apenas admins possam modificar

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own custom stages" ON public.custom_stages;
DROP POLICY IF EXISTS "Users can create their own custom stages" ON public.custom_stages;
DROP POLICY IF EXISTS "Users can update their own custom stages" ON public.custom_stages;
DROP POLICY IF EXISTS "Users can delete their own custom stages" ON public.custom_stages;

-- Criar novas políticas
CREATE POLICY "All users can view custom stages" 
ON public.custom_stages 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can create custom stages" 
ON public.custom_stages 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update custom stages" 
ON public.custom_stages 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete custom stages" 
ON public.custom_stages 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Converter stages existentes para serem globais
-- Manter apenas as stages de admins e remover duplicatas
UPDATE public.custom_stages 
SET user_id = NULL 
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);

-- Remover stages duplicadas de usuários não-admin
DELETE FROM public.custom_stages 
WHERE user_id IS NOT NULL 
AND user_id NOT IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);