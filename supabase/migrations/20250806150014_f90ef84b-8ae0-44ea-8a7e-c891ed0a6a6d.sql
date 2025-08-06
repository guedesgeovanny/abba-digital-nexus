-- Insert default agent records for the system modules
-- First, let's insert the two fixed modules as real agents in the database
-- These will serve as the base agents that users can connect to WhatsApp

-- Insert Agente-de-IA
INSERT INTO public.agents (
  name,
  description,
  type,
  channel,
  status,
  configuration,
  user_id
) VALUES (
  'Agente-de-IA',
  'Módulo de atendimento automatizado com inteligência artificial',
  'ai',
  'whatsapp',
  'inactive',
  '{"connection_status": "disconnected", "evolution_api_key": null, "evolution_instance_name": null}',
  'b96ed1ff-3414-4f1a-9f9e-476dafe39e56'  -- This is the default user_id from conversations table
) ON CONFLICT (name, user_id) DO NOTHING;

-- Insert Atendimento-Humano  
INSERT INTO public.agents (
  name,
  description,
  type,
  channel,
  status,
  configuration,
  user_id
) VALUES (
  'Atendimento-Humano',
  'Módulo para atendimento humanizado com agentes reais',
  'human',
  'whatsapp',
  'inactive',
  '{"connection_status": "disconnected", "evolution_api_key": null, "evolution_instance_name": null}',
  'b96ed1ff-3414-4f1a-9f9e-476dafe39e56'  -- This is the default user_id from conversations table
) ON CONFLICT (name, user_id) DO NOTHING;