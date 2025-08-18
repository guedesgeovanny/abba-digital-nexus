-- Fix realtime configuration for better synchronization
-- Enable REPLICA IDENTITY FULL for custom_stages to capture complete row data
ALTER TABLE public.custom_stages REPLICA IDENTITY FULL;

-- Ensure all CRM tables have REPLICA IDENTITY FULL for complete realtime updates
ALTER TABLE public.contacts REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already added
DO $$
BEGIN
    -- Add custom_stages to realtime publication
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_stages;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Add contacts to realtime publication
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Add conversations to realtime publication
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Synchronize inconsistent crm_stage data between contacts and conversations
-- Update contacts crm_stage to match conversations where they differ
UPDATE public.contacts 
SET crm_stage = c.crm_stage,
    updated_at = now()
FROM public.conversations c 
WHERE contacts.id = c.contact_id 
AND contacts.crm_stage != c.crm_stage
AND c.crm_stage IS NOT NULL;

-- Update conversations crm_stage to match contacts where contacts have newer data
UPDATE public.conversations 
SET crm_stage = ct.crm_stage,
    updated_at = now()
FROM public.contacts ct 
WHERE conversations.contact_id = ct.id 
AND conversations.crm_stage != ct.crm_stage
AND ct.updated_at > conversations.updated_at;

-- Create function to keep crm_stage synchronized between tables
CREATE OR REPLACE FUNCTION sync_crm_stage()
RETURNS TRIGGER AS $$
BEGIN
    -- If updating contacts table, sync to conversations
    IF TG_TABLE_NAME = 'contacts' THEN
        UPDATE public.conversations 
        SET crm_stage = NEW.crm_stage, 
            updated_at = now()
        WHERE contact_id = NEW.id 
        AND crm_stage != NEW.crm_stage;
        
        RETURN NEW;
    END IF;
    
    -- If updating conversations table, sync to contacts
    IF TG_TABLE_NAME = 'conversations' AND NEW.contact_id IS NOT NULL THEN
        UPDATE public.contacts 
        SET crm_stage = NEW.crm_stage, 
            updated_at = now()
        WHERE id = NEW.contact_id 
        AND crm_stage != NEW.crm_stage;
        
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to keep crm_stage synchronized
DROP TRIGGER IF EXISTS sync_contacts_crm_stage ON public.contacts;
CREATE TRIGGER sync_contacts_crm_stage
    AFTER UPDATE OF crm_stage ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION sync_crm_stage();

DROP TRIGGER IF EXISTS sync_conversations_crm_stage ON public.conversations;
CREATE TRIGGER sync_conversations_crm_stage
    AFTER UPDATE OF crm_stage ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION sync_crm_stage();