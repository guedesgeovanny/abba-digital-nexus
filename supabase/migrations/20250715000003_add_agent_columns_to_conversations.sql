-- Add agent-related columns to conversations table
ALTER TABLE conversations 
ADD COLUMN have_agent boolean DEFAULT false,
ADD COLUMN status_agent text CHECK (status_agent IN ('Ativo', 'Inativo'));