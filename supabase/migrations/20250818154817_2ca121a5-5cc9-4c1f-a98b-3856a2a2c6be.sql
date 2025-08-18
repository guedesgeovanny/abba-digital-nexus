-- Fix RLS policy for contacts table to allow users to update contacts from their own conversations
DROP POLICY IF EXISTS "Users can update accessible contacts" ON public.contacts;

CREATE POLICY "Users can update accessible contacts" ON public.contacts
FOR UPDATE USING (
  auth.uid() = user_id OR
  get_current_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.contact_id = contacts.id 
    AND (conversations.assigned_to = auth.uid() OR conversations.user_id = auth.uid())
  )
);