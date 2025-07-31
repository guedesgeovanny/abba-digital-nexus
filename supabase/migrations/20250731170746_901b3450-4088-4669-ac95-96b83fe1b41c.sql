-- Drop the existing restrictive policy
DROP POLICY "Users can view their own contacts" ON public.contacts;

-- Create new policy that allows:
-- 1. Users to view their own contacts
-- 2. Admins to view all contacts  
-- 3. Users to view contacts of conversations assigned to them
CREATE POLICY "Users can view accessible contacts" ON public.contacts
FOR SELECT 
USING (
  auth.uid() = user_id OR
  (SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin' OR
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.contact_id = contacts.id 
    AND conversations.assigned_to = auth.uid()
  )
);