-- Add profile picture URL column to save WhatsApp avatar for connections
ALTER TABLE public.conexoes
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Optional: comment for documentation
COMMENT ON COLUMN public.conexoes.profile_picture_url IS 'URL da foto de perfil retornada pelo polling de confirmação da conexão (WhatsApp)';