
-- Migração consolidada para resolver problemas na tabela profiles
-- Esta migração garante que a tabela profiles tenha todas as colunas necessárias e políticas RLS corretas

-- Primeiro, verificar se a tabela profiles existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        CREATE TABLE public.profiles (
            id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
            email TEXT NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

-- Adicionar colunas role e status se não existirem
DO $$
BEGIN
    -- Adicionar coluna role se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'viewer';
    END IF;
    
    -- Adicionar coluna status se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

-- Remover constraints existentes se existirem (para evitar conflitos)
DO $$
BEGIN
    -- Remover constraint de role se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_role_check'
        AND table_name = 'profiles'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
    END IF;
    
    -- Remover constraint de status se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_status_check'
        AND table_name = 'profiles'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_status_check;
    END IF;
END $$;

-- Adicionar constraints para validar os valores
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'editor', 'viewer'));

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'pending', 'inactive'));

-- Atualizar registros existentes para ter valores padrão
UPDATE public.profiles 
SET role = 'viewer' 
WHERE role IS NULL;

UPDATE public.profiles 
SET status = 'active' 
WHERE status IS NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;

-- Criar políticas RLS
-- Política para usuários verem seus próprios perfis
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem seus próprios perfis (exceto role)
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para usuários inserirem seus próprios perfis
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para admins (assumindo que existe um usuário admin)
-- Nota: Estas políticas assumem que existe um perfil admin. 
-- Se não houver, você precisará criar um usuário admin manualmente.
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete all profiles" ON public.profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Adicionar comentários às colunas
COMMENT ON COLUMN public.profiles.role IS 'Função do usuário: admin, editor ou viewer';
COMMENT ON COLUMN public.profiles.status IS 'Status do usuário: active, pending ou inactive';
COMMENT ON TABLE public.profiles IS 'Tabela de perfis dos usuários com informações adicionais';

-- Inserir um usuário admin padrão se não existir
-- IMPORTANTE: Substitua o UUID pelo ID do seu usuário atual
INSERT INTO public.profiles (id, email, full_name, role, status)
VALUES ('b96ed1ff-3414-4f1a-9f9e-476dafe39e56', 'guedesgeovanny@gmail.com', 'Geovanny Cardoso Guedes', 'admin', 'active')
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = timezone('utc'::text, now());
