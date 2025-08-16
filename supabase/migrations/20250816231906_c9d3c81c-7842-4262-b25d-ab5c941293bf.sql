-- Create table to track read messages per user
CREATE TABLE IF NOT EXISTS public.conversation_read_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, conversation_id)
);

-- Enable Row Level Security
ALTER TABLE public.conversation_read_status ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation_read_status
CREATE POLICY "Users can view their own read status" 
ON public.conversation_read_status 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own read status" 
ON public.conversation_read_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own read status" 
ON public.conversation_read_status 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conversation_read_status_updated_at
BEFORE UPDATE ON public.conversation_read_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_conversation_read_status_user_conversation ON public.conversation_read_status(user_id, conversation_id);
CREATE INDEX idx_conversation_read_status_conversation ON public.conversation_read_status(conversation_id);