-- Update RLS policy to allow all users to see unassigned conversations
DROP POLICY IF EXISTS "Users can view their conversations and assigned ones" ON public.conversations;

CREATE POLICY "Users can view their conversations, assigned ones, and unassigned" 
ON public.conversations 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() = assigned_to) OR 
  (assigned_to IS NULL) OR 
  ((SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin')
);

-- Update policy to allow all users to update unassigned conversations
DROP POLICY IF EXISTS "Users can update accessible conversations" ON public.conversations;

CREATE POLICY "Users can update accessible conversations" 
ON public.conversations 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() = assigned_to) OR 
  (assigned_to IS NULL) OR 
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]))
);