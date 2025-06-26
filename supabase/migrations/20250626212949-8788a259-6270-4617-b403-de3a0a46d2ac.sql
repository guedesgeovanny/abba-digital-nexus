
-- Adicionar coluna contact_id na tabela conversations para referenciar a tabela contacts
ALTER TABLE public.conversations 
ADD COLUMN contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL;

-- Criar índice para melhor performance nas consultas
CREATE INDEX idx_conversations_contact_id ON public.conversations(contact_id);

-- Comentário: Esta coluna é opcional, permitindo conversas que podem ou não estar ligadas a um contato existente na tabela contacts
