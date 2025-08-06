-- Insert default agent records for the system modules using correct enum values
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
  'atendimento',
  'whatsapp',
  'inactive',
  '{"connection_status": "disconnected", "evolution_api_key": null, "evolution_instance_name": null}',
  'b96ed1ff-3414-4f1a-9f9e-476dafe39e56'
) ON CONFLICT DO NOTHING;

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
  'atendimento',
  'whatsapp',
  'inactive',
  '{"connection_status": "disconnected", "evolution_api_key": null, "evolution_instance_name": null}',
  'b96ed1ff-3414-4f1a-9f9e-476dafe39e56'
) ON CONFLICT DO NOTHING;