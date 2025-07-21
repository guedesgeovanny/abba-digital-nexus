-- Add mensagem_is_agent column to messages table
ALTER TABLE messages 
ADD COLUMN mensagem_is_agent BOOLEAN DEFAULT FALSE;

-- Add comment for clarity
COMMENT ON COLUMN messages.mensagem_is_agent IS 'Indicates if the message was sent by an AI agent';