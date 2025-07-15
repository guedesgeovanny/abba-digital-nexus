-- Update existing conversations to have some test agent data
UPDATE conversations 
SET have_agent = true, status_agent = 'Ativo' 
WHERE id IN (
    SELECT id FROM conversations 
    ORDER BY last_message_at DESC 
    LIMIT 2
);

-- Update one conversation to be inactive
UPDATE conversations 
SET have_agent = true, status_agent = 'Inativo' 
WHERE id IN (
    SELECT id FROM conversations 
    WHERE have_agent = true 
    ORDER BY last_message_at DESC 
    LIMIT 1
);