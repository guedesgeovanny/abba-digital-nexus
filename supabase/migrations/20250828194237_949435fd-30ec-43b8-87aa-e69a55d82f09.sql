-- Adicionar campo 'active' na tabela conexoes para controlar se a conexão está ativa ou não
ALTER TABLE public.conexoes 
ADD COLUMN active boolean NOT NULL DEFAULT true;

-- Adicionar índice para melhor performance nas consultas por status ativo
CREATE INDEX idx_conexoes_active ON public.conexoes(active);