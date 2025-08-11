-- Add profile name and contact to conexoes
ALTER TABLE public.conexoes
ADD COLUMN IF NOT EXISTS profile_name TEXT,
ADD COLUMN IF NOT EXISTS contact TEXT;

COMMENT ON COLUMN public.conexoes.profile_name IS 'Nome do perfil conectado (WhatsApp)';
COMMENT ON COLUMN public.conexoes.contact IS 'Número/contato do WhatsApp conectado';