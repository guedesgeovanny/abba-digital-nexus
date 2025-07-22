-- Testar exclusão do usuário Fulano Teste
DELETE FROM profiles WHERE id = '029480e2-16ec-4f49-8761-199613d84687';

-- Verificar se foi excluído
SELECT id, email, full_name, role, status FROM profiles;