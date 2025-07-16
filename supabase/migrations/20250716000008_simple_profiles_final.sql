
-- Migração simplificada final para tabela profiles
-- Remove toda complexidade e foca apenas no essencial

-- Garantir que a tabela profiles existe com estrutura básica
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar colunas role e status se não existirem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'viewer';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

-- Constraints simples para role e status
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'editor', 'viewer'));

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'pending', 'inactive'));

-- Atualizar valores NULL
UPDATE public.profiles SET role = 'viewer' WHERE role IS NULL;
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;

-- RLS simples - qualquer usuário autenticado pode fazer CRUD
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;

-- Políticas simples: usuários autenticados podem fazer tudo
CREATE POLICY "Authenticated users can select profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update profiles" ON public.profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete profiles" ON public.profiles
    FOR DELETE USING (auth.role() = 'authenticated');

-- Trigger para updated_at
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

-- Inserir usuário admin se não existir
INSERT INTO public.profiles (id, email, full_name, role, status)
VALUES ('b96ed1ff-3414-4f1a-9f9e-476dafe39e56', 'guedesgeovanny@gmail.com', 'Geovanny Cardoso Guedes', 'admin', 'active')
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = timezone('utc'::text, now());
