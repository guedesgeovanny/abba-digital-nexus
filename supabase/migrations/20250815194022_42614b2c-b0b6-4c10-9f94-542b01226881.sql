-- Create table for basic stage customizations
CREATE TABLE public.basic_stage_customizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage_key TEXT NOT NULL, -- 'novo_lead', 'em_andamento', etc.
  custom_name TEXT NOT NULL,
  custom_color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, stage_key)
);

-- Enable RLS
ALTER TABLE public.basic_stage_customizations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own basic stage customizations" 
ON public.basic_stage_customizations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own basic stage customizations" 
ON public.basic_stage_customizations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own basic stage customizations" 
ON public.basic_stage_customizations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own basic stage customizations" 
ON public.basic_stage_customizations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_basic_stage_customizations_updated_at
BEFORE UPDATE ON public.basic_stage_customizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();