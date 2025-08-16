-- Update RLS policy to ensure admins can see ALL connections
DROP POLICY IF EXISTS "Users can view their own and assigned conexoes" ON public.conexoes;

CREATE POLICY "Users can view their own and assigned conexoes" 
ON public.conexoes 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid()::text = ANY(SELECT jsonb_array_elements_text(assigned_users)) OR
  get_current_user_role() = 'admin'
);