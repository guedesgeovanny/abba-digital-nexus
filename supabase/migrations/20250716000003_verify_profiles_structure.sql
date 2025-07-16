-- Verificar se as colunas role e status existem na tabela profiles
-- Se não existirem, criar as colunas
DO $$
BEGIN
  -- Verificar se a coluna role existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer'));
  END IF;

  -- Verificar se a coluna status existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive'));
  END IF;
END $$;

-- Atualizar usuários existentes com valores padrão se necessário
UPDATE profiles 
SET role = 'viewer' 
WHERE role IS NULL;

UPDATE profiles 
SET status = 'active' 
WHERE status IS NULL;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);