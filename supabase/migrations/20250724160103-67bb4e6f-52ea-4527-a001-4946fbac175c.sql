-- Create custom_stages table for user-defined CRM stages
CREATE TABLE public.custom_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_stages ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own custom stages"
ON public.custom_stages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom stages"
ON public.custom_stages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom stages"
ON public.custom_stages
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom stages"
ON public.custom_stages
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_stages_updated_at
BEFORE UPDATE ON public.custom_stages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_custom_stages_user_id ON public.custom_stages(user_id);
CREATE INDEX idx_custom_stages_position ON public.custom_stages(user_id, position);