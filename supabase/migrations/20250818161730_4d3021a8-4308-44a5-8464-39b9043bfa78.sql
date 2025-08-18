-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can update accessible contacts" ON public.contacts;

-- Create a new permissive policy that allows any authenticated user to update contacts
CREATE POLICY "Users can update accessible contacts" ON public.contacts
FOR UPDATE 
USING (auth.uid() IS NOT NULL);