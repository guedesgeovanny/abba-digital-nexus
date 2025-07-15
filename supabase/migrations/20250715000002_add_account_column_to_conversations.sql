-- Add account column to conversations table
ALTER TABLE conversations 
ADD COLUMN account TEXT;

-- Add some sample data for testing
UPDATE conversations 
SET account = CASE 
    WHEN channel = 'whatsapp' THEN 'WhatsApp Business'
    WHEN channel = 'instagram' THEN 'Instagram'
    WHEN channel = 'messenger' THEN 'Facebook Messenger'
    ELSE 'Principal'
END
WHERE account IS NULL;