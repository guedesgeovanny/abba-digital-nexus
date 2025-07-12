-- Add value field to contacts table for CRM functionality
ALTER TABLE contacts 
ADD COLUMN value DECIMAL(10,2) DEFAULT 0;

-- Add comment to describe the field
COMMENT ON COLUMN contacts.value IS 'Estimated opportunity value in BRL for CRM pipeline';

-- Update existing contacts with default estimated values based on status
UPDATE contacts 
SET value = CASE 
  WHEN status = 'novo' THEN 5000.00
  WHEN status = 'em_andamento' THEN 8000.00
  WHEN status = 'qualificado' THEN 15000.00
  WHEN status = 'convertido' THEN 25000.00
  WHEN status = 'perdido' THEN 3000.00
  ELSE 5000.00
END
WHERE value = 0;