-- Atualizar configuração dos agentes para ter evolution_instance_name correto
UPDATE public.agents 
SET configuration = jsonb_set(
  COALESCE(configuration, '{}'::jsonb), 
  '{evolution_instance_name}', 
  CASE 
    WHEN name LIKE '%IA%' OR name LIKE '%Agente%' THEN '"Agente-de-IA"'
    ELSE '"Atendimento-Humano"'
  END
)
WHERE configuration IS NULL 
   OR configuration->>'evolution_instance_name' IS NULL;