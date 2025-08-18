-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can update accessible contacts" ON public.contacts;

-- Create a new policy that allows users to update contacts if:
-- 1. They own the contact, OR
-- 2. They are admin, OR  
-- 3. The contact is associated with a conversation they own or are assigned to
CREATE POLICY "Users can update accessible contacts" ON public.contacts
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (get_current_user_role() = 'admin') OR 
  (EXISTS (
    SELECT 1 
    FROM conversations 
    WHERE conversations.contact_id = contacts.id 
    AND (
      conversations.user_id = auth.uid() OR 
      conversations.assigned_to = auth.uid()
    )
  ))
);