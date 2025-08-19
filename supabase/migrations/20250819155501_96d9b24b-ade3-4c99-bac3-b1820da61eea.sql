-- Fix the sync_user_id function with correct PL/pgSQL syntax
CREATE OR REPLACE FUNCTION public.sync_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    result_count INTEGER;
BEGIN
    -- Only proceed if user_id actually changed
    IF OLD.user_id IS NOT DISTINCT FROM NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    RAISE LOG 'sync_user_id triggered on table: %, OLD user_id: %, NEW user_id: %', TG_TABLE_NAME, OLD.user_id, NEW.user_id;
    
    -- If updating conversations table, sync to contacts
    IF TG_TABLE_NAME = 'conversations' THEN
        -- Check if contact_id exists and is not null
        IF NEW.contact_id IS NOT NULL THEN
            RAISE LOG 'Syncing from conversations to contacts for contact_id: %', NEW.contact_id;
            
            UPDATE public.contacts 
            SET user_id = NEW.user_id,
                updated_at = now()
            WHERE id = NEW.contact_id 
            AND user_id IS DISTINCT FROM NEW.user_id;
            
            GET DIAGNOSTICS result_count = ROW_COUNT;
            RAISE LOG 'Updated % contact rows', result_count;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- If updating contacts table, sync to conversations  
    IF TG_TABLE_NAME = 'contacts' THEN
        RAISE LOG 'Syncing from contacts to conversations for contact_id: %', NEW.id;
        
        UPDATE public.conversations 
        SET user_id = NEW.user_id, 
            updated_at = now()
        WHERE contact_id = NEW.id 
        AND user_id IS DISTINCT FROM NEW.user_id;
        
        GET DIAGNOSTICS result_count = ROW_COUNT;
        RAISE LOG 'Updated % conversation rows', result_count;
        
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$function$;