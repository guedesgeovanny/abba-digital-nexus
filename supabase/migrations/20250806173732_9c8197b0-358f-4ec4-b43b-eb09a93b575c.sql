-- Atualizar a configuração dos agentes para incluir o evolution_instance_name correto
UPDATE agents 
SET configuration = jsonb_set(
  COALESCE(configuration, '{}'::jsonb),
  '{evolution_instance_name}',
  '"Atendimento-Humano"'::jsonb
)
WHERE name = 'Atendimento-Humano';

UPDATE agents 
SET configuration = jsonb_set(
  COALESCE(configuration, '{}'::jsonb),
  '{evolution_instance_name}',
  '"Agente-de-IA"'::jsonb
)
WHERE name = 'Agente-de-IA';