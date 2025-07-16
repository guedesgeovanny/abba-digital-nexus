-- Adicionar colunas role e status à tabela profiles
ALTER TABLE profiles 
ADD COLUMN role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive'));

-- Atualizar usuários existentes com role padrão 'viewer' e status 'active'
UPDATE profiles 
SET role = 'viewer', status = 'active' 
WHERE role IS NULL OR status IS NULL;

-- Criar índices para melhor performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Adicionar comentários às colunas
COMMENT ON COLUMN profiles.role IS 'Função do usuário: admin, editor ou viewer';
COMMENT ON COLUMN profiles.status IS 'Status do usuário: active, pending ou inactive';