-- Criar tabela para conexões favoritas do usuário
CREATE TABLE public.user_favorite_connections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, connection_name)
);

-- Enable RLS
ALTER TABLE public.user_favorite_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for user favorite connections
CREATE POLICY "Users can view their own favorite connections" 
ON public.user_favorite_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite connections" 
ON public.user_favorite_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorite connections" 
ON public.user_favorite_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite connections" 
ON public.user_favorite_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_favorite_connections_updated_at
BEFORE UPDATE ON public.user_favorite_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();