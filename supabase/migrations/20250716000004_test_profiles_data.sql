-- Script de teste para verificar dados na tabela profiles
-- Este script apenas verifica a estrutura, não insere dados

-- Mostrar estrutura da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar se existem dados na tabela
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as users_with_role,
  COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as users_with_status
FROM profiles;

-- Mostrar exemplos de dados (apenas para verificação)
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  avatar_url IS NOT NULL as has_avatar
FROM profiles
LIMIT 5;