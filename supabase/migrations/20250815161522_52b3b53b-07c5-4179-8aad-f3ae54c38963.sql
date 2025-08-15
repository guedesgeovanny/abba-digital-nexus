-- Fix security vulnerability in n8n_chat_histories table
-- Add user_id column to associate chat histories with users
ALTER TABLE public.n8n_chat_histories 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view only their own chat histories
CREATE POLICY "Users can view their own chat histories" 
ON public.n8n_chat_histories 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to create their own chat histories
CREATE POLICY "Users can create their own chat histories" 
ON public.n8n_chat_histories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own chat histories
CREATE POLICY "Users can update their own chat histories" 
ON public.n8n_chat_histories 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy for users to delete their own chat histories
CREATE POLICY "Users can delete their own chat histories" 
ON public.n8n_chat_histories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin policy to view all chat histories (optional, for admin oversight)
CREATE POLICY "Admins can view all chat histories" 
ON public.n8n_chat_histories 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create index for better performance on user_id queries
CREATE INDEX idx_n8n_chat_histories_user_id ON public.n8n_chat_histories(user_id);