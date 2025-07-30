-- Add new status values to conversation_status enum
ALTER TYPE conversation_status ADD VALUE IF NOT EXISTS 'novo';
ALTER TYPE conversation_status ADD VALUE IF NOT EXISTS 'qualificado'; 
ALTER TYPE conversation_status ADD VALUE IF NOT EXISTS 'convertido';
ALTER TYPE conversation_status ADD VALUE IF NOT EXISTS 'perdido';