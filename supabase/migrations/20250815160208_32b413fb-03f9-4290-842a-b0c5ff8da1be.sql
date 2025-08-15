-- Add CPF/CNPJ column to contacts table
ALTER TABLE public.contacts 
ADD COLUMN cpf_cnpj TEXT;