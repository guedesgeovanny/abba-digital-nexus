-- Migration to convert basic CRM stages to custom stages (except entry stage)
-- This will make all stages customizable except "Etapa de Entrada"

-- First, let's create custom stages for users who don't have them yet
-- We'll create the default stages that were previously "basic"

DO $$
DECLARE
    user_record RECORD;
    stage_exists BOOLEAN;
BEGIN
    -- Loop through all users with profiles
    FOR user_record IN SELECT id FROM profiles LOOP
        -- Check if user already has custom stages
        SELECT EXISTS(SELECT 1 FROM custom_stages WHERE user_id = user_record.id) INTO stage_exists;
        
        -- If user doesn't have custom stages, create the default ones
        IF NOT stage_exists THEN
            -- Insert default custom stages (excluding the entry stage which remains fixed)
            INSERT INTO custom_stages (user_id, name, color, position) VALUES
            (user_record.id, 'Em Andamento', '#f59e0b', 0),
            (user_record.id, 'Qualificado', '#10b981', 1),
            (user_record.id, 'Convertido', '#059669', 2),
            (user_record.id, 'Perdido', '#ef4444', 3);
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Default custom stages created for all users';
END $$;

-- Update any existing conversations that use old stage names to use custom stage names
-- Map old stage values to new custom stage format
UPDATE conversations 
SET crm_stage = CASE crm_stage
    WHEN 'em_andamento' THEN 'custom:Em Andamento'
    WHEN 'qualificado' THEN 'custom:Qualificado' 
    WHEN 'convertido' THEN 'custom:Convertido'
    WHEN 'perdido' THEN 'custom:Perdido'
    WHEN 'novo' THEN 'novo_lead'
    WHEN 'novo_lead' THEN 'novo_lead'
    ELSE crm_stage
END
WHERE crm_stage IN ('em_andamento', 'qualificado', 'convertido', 'perdido', 'novo');

-- Update contacts table similarly 
UPDATE contacts 
SET crm_stage = CASE crm_stage
    WHEN 'em_andamento' THEN 'custom:Em Andamento'
    WHEN 'qualificado' THEN 'custom:Qualificado' 
    WHEN 'convertido' THEN 'custom:Convertido'
    WHEN 'perdido' THEN 'custom:Perdido'
    WHEN 'novo' THEN 'novo_lead'
    WHEN 'novo_lead' THEN 'novo_lead'
    ELSE crm_stage
END
WHERE crm_stage IN ('em_andamento', 'qualificado', 'convertido', 'perdido', 'novo');

-- Remove basic stage customizations as they're no longer needed
-- All stages except entry are now custom stages
DROP TABLE IF EXISTS basic_stage_customizations;