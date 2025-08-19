-- Create function to sync user_id between conversations and contacts
CREATE OR REPLACE FUNCTION public.sync_user_id()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- If updating conversations table, sync to contacts
    IF TG_TABLE_NAME = 'conversations' AND NEW.contact_id IS NOT NULL THEN
        UPDATE public.contacts 
        SET user_id = NEW.user_id,
            updated_at = now()
        WHERE id = NEW.contact_id 
        AND user_id != NEW.user_id;
        
        RETURN NEW;
    END IF;
    
    -- If updating contacts table, sync to conversations
    IF TG_TABLE_NAME = 'contacts' THEN
        UPDATE public.conversations 
        SET user_id = NEW.user_id, 
            updated_at = now()
        WHERE contact_id = NEW.id 
        AND user_id != NEW.user_id;
        
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create trigger for conversations table
CREATE TRIGGER sync_user_id_from_conversations
    AFTER UPDATE OF user_id ON public.conversations
    FOR EACH ROW
    WHEN (OLD.user_id IS DISTINCT FROM NEW.user_id)
    EXECUTE FUNCTION public.sync_user_id();

-- Create trigger for contacts table  
CREATE TRIGGER sync_user_id_from_contacts
    AFTER UPDATE OF user_id ON public.contacts
    FOR EACH ROW
    WHEN (OLD.user_id IS DISTINCT FROM NEW.user_id)
    EXECUTE FUNCTION public.sync_user_id();