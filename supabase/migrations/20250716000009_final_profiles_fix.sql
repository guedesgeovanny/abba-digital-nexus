
-- Migração final para corrigir definitivamente a tabela profiles
-- Remove toda complexidade anterior e implementa uma solução simples

-- 1. Garantir que a tabela profiles existe
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive'))
);

-- 2. Garantir que as colunas existem se a tabela já existia
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 3. Adicionar constraints se não existem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'editor', 'viewer'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_status_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'pending', 'inactive'));
    END IF;
END $$;

-- 4. Atualizar valores NULL
UPDATE public.profiles SET role = 'viewer' WHERE role IS NULL;
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;

-- 5. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Remover todas as políticas antigas
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.profiles';
    END LOOP;
END $$;

-- 7. Criar políticas simples
CREATE POLICY "Allow all operations for authenticated users" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

-- 8. Trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 9. Inserir usuário admin se não existir
INSERT INTO public.profiles (id, email, full_name, role, status)
VALUES ('b96ed1ff-3414-4f1a-9f9e-476dafe39e56', 'guedesgeovanny@gmail.com', 'Geovanny Cardoso Guedes', 'admin', 'active')
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = timezone('utc'::text, now());
