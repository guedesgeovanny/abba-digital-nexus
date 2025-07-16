-- Forçar a adição das colunas role e status se não existirem
DO $$
BEGIN
    -- Adicionar coluna role se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'viewer';
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'editor', 'viewer'));
    END IF;
    
    -- Adicionar coluna status se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'status'
    ) THEN
        ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'active';
        ALTER TABLE profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'pending', 'inactive'));
    END IF;
END $$;

-- Atualizar registros existentes para ter valores padrão
UPDATE profiles SET role = 'viewer' WHERE role IS NULL;
UPDATE profiles SET status = 'active' WHERE status IS NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);