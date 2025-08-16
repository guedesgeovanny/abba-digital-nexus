-- Add assigned_users column to conexoes table
ALTER TABLE public.conexoes 
ADD COLUMN assigned_users JSONB DEFAULT '[]'::jsonb;

-- Update RLS policies to allow access for assigned users
DROP POLICY IF EXISTS "Users can view their own conexoes" ON public.conexoes;
DROP POLICY IF EXISTS "Users can update their own conexoes" ON public.conexoes;
DROP POLICY IF EXISTS "Users can delete their own conexoes" ON public.conexoes;

-- Create new policies that consider assigned users
CREATE POLICY "Users can view their own and assigned conexoes" 
ON public.conexoes 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid()::text = ANY(SELECT jsonb_array_elements_text(assigned_users))
);

CREATE POLICY "Users can update their own conexoes" 
ON public.conexoes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conexoes" 
ON public.conexoes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow admins to update assigned_users for any connection
CREATE POLICY "Admins can update connection assignments" 
ON public.conexoes 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

-- Add index for better performance on assigned_users queries
CREATE INDEX IF NOT EXISTS idx_conexoes_assigned_users ON public.conexoes USING GIN (assigned_users);