-- Add debug logging to sync_user_id function and fix potential RLS issues
CREATE OR REPLACE FUNCTION public.sync_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RAISE LOG 'sync_user_id triggered on table: %, OLD user_id: %, NEW user_id: %', TG_TABLE_NAME, OLD.user_id, NEW.user_id;
    
    -- If updating conversations table, sync to contacts
    IF TG_TABLE_NAME = 'conversations' AND NEW.contact_id IS NOT NULL THEN
        RAISE LOG 'Syncing from conversations to contacts for contact_id: %', NEW.contact_id;
        
        UPDATE public.contacts 
        SET user_id = NEW.user_id,
            updated_at = now()
        WHERE id = NEW.contact_id 
        AND user_id != NEW.user_id;
        
        RAISE LOG 'Updated % contact rows', (SELECT ROW_COUNT);
        RETURN NEW;
    END IF;
    
    -- If updating contacts table, sync to conversations
    IF TG_TABLE_NAME = 'contacts' THEN
        RAISE LOG 'Syncing from contacts to conversations for contact_id: %', NEW.id;
        
        UPDATE public.conversations 
        SET user_id = NEW.user_id, 
            updated_at = now()
        WHERE contact_id = NEW.id 
        AND user_id != NEW.user_id;
        
        RAISE LOG 'Updated % conversation rows', (SELECT ROW_COUNT);
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Also create a policy to allow the sync function to update contacts regardless of ownership
CREATE POLICY "Allow sync function to update contacts" 
ON public.contacts 
FOR UPDATE 
USING (true);  -- This allows the SECURITY DEFINER function to update any contact