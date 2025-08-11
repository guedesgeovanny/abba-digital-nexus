-- 1) Tabela conexoes
CREATE TABLE IF NOT EXISTS public.conexoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'whatsapp',
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  configuration JSONB NOT NULL DEFAULT jsonb_build_object(
    'connection_status', 'disconnected',
    'evolution_api_key', NULL,
    'evolution_instance_name', NULL
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_conexoes_user_id ON public.conexoes (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_conexoes_user_name ON public.conexoes (user_id, name);

-- 2) Habilitar RLS
ALTER TABLE public.conexoes ENABLE ROW LEVEL SECURITY;

-- 3) Políticas RLS
DROP POLICY IF EXISTS "Users/admin can select their connections" ON public.conexoes;
CREATE POLICY "Users/admin can select their connections"
ON public.conexoes
FOR SELECT
USING (
  auth.uid() = user_id OR get_current_user_role() = 'admin'
);

DROP POLICY IF EXISTS "Users/admin can insert connections" ON public.conexoes;
CREATE POLICY "Users/admin can insert connections"
ON public.conexoes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR get_current_user_role() = 'admin'
);

DROP POLICY IF EXISTS "Users/admin can update connections" ON public.conexoes;
CREATE POLICY "Users/admin can update connections"
ON public.conexoes
FOR UPDATE
USING (
  auth.uid() = user_id OR get_current_user_role() = 'admin'
);

DROP POLICY IF EXISTS "Users/admin can delete connections" ON public.conexoes;
CREATE POLICY "Users/admin can delete connections"
ON public.conexoes
FOR DELETE
USING (
  auth.uid() = user_id OR get_current_user_role() = 'admin'
);

-- 4) Trigger para updated_at
DROP TRIGGER IF EXISTS trg_conexoes_updated_at ON public.conexoes;
CREATE TRIGGER trg_conexoes_updated_at
BEFORE UPDATE ON public.conexoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();