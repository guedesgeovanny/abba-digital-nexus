-- Fix security warnings by setting search_path for sync functions
CREATE OR REPLACE FUNCTION public.sync_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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