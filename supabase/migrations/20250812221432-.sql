-- Criar tabela conexoes com a estrutura especificada
CREATE TABLE IF NOT EXISTS public.conexoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'whatsapp',
  channel TEXT DEFAULT 'whatsapp',
  status TEXT NOT NULL DEFAULT 'disconnected',
  configuration JSONB DEFAULT '{"connection_status": "disconnected", "evolution_api_key": null, "evolution_instance_name": null}'::jsonb,
  whatsapp_connected_at TIMESTAMP WITH TIME ZONE,
  whatsapp_profile_name TEXT,
  whatsapp_contact TEXT,
  whatsapp_profile_picture_url TEXT,
  whatsapp_profile_picture_data TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.conexoes ENABLE ROW LEVEL SECURITY;

-- Criar policies
CREATE POLICY "Users can view their own conexoes" 
  ON public.conexoes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conexoes" 
  ON public.conexoes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conexoes" 
  ON public.conexoes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conexoes" 
  ON public.conexoes FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_conexoes_updated_at
  BEFORE UPDATE ON public.conexoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();