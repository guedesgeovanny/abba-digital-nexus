-- Verificar se existe o trigger para criar perfis automaticamente
SELECT trigger_name, event_manipulation, action_statement, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND event_object_schema = 'auth';

-- Verificar a função handle_new_user
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';