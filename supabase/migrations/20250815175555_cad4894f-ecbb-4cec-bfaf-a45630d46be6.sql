-- Separate CRM stage from conversation status
-- Add crm_stage column to conversations table for CRM pipeline tracking
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS crm_stage text DEFAULT 'novo';

-- Reset status column to handle conversation open/closed state
UPDATE conversations SET status = CASE 
  WHEN status IN ('convertido', 'fechada', 'perdido') THEN 'fechada'
  ELSE 'aberta'
END;

-- Add crm_stage column to contacts table for CRM pipeline tracking  
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS crm_stage text DEFAULT 'novo';

-- Update contacts crm_stage based on current status if it contains CRM info
UPDATE contacts SET crm_stage = CASE
  WHEN status LIKE 'custom:%' THEN status
  WHEN status IN ('novo', 'qualificado', 'convertido', 'perdido') THEN status
  ELSE 'novo'
END;

-- Reset contacts status to handle contact lifecycle state
UPDATE contacts SET status = CASE
  WHEN status IN ('convertido', 'fechada', 'perdido') THEN 'inativo'
  ELSE 'ativo'
END;