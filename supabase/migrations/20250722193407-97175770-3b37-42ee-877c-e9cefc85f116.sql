
-- 1. Corrigir dados existentes - atualizar usuários com role e status NULL
UPDATE public.profiles 
SET 
  role = 'viewer',
  status = 'active'
WHERE role IS NULL OR status IS NULL;

-- 2. Corrigir políticas RLS da tabela profiles
-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- 3. Criar função de segurança para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 4. Criar novas políticas RLS mais flexíveis
-- Política para usuários verem seus próprios perfis
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para admins verem todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Política para usuários atualizarem seus próprios perfis
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para admins atualizarem todos os perfis
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Política para criação de perfis (necessária para signup)
CREATE POLICY "Allow profile creation on signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para admins criarem perfis
CREATE POLICY "Admins can create profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

-- 5. Habilitar RLS em tabelas que estão sem proteção
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas para media_files
CREATE POLICY "Users can manage their own media files" ON public.media_files
  FOR ALL USING (uploaded_by = auth.uid());

-- 6. Garantir que constraints existem
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'editor', 'viewer'));

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'pending', 'inactive'));

-- 7. Definir usuário admin se não existir com role admin
UPDATE public.profiles 
SET role = 'admin', status = 'active'
WHERE id = 'b96ed1ff-3414-4f1a-9f9e-476dafe39e56';
