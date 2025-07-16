
-- Migration final para adicionar colunas role e status na tabela profiles
-- Esta migração garante que as colunas sejam criadas corretamente

-- Primeiro, verificar se as colunas já existem e adicioná-las se necessário
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
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
    END IF;
    
    -- Remover constraint de status se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_status_check'
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

-- Adicionar comentários às colunas
COMMENT ON COLUMN public.profiles.role IS 'Função do usuário: admin, editor ou viewer';
COMMENT ON COLUMN public.profiles.status IS 'Status do usuário: active, pending ou inactive';
