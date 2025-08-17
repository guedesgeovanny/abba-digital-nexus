-- Update the policy to allow assigned users to update connection status
DROP POLICY IF EXISTS "Users can update their own conexoes" ON conexoes;

-- Create new policy that allows both owners and assigned users to update connections
CREATE POLICY "Users can update their own conexoes or assigned ones" 
ON conexoes 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  assigned_users @> jsonb_build_array((auth.uid())::text)
);