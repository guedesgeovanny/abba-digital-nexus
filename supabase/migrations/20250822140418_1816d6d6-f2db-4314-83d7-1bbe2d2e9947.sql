-- Migração para popular as colunas connection_account e connection_name nas mensagens existentes
-- Atualizando mensagens existentes com base na conversa atual

-- Primeiro, vamos popular connection_account das mensagens existentes
UPDATE public.messages 
SET connection_account = conversations.account
FROM public.conversations 
WHERE messages.conversa_id = conversations.id 
AND messages.connection_account IS NULL
AND conversations.account IS NOT NULL;

-- Para connection_name, vamos tentar buscar da tabela conexoes
UPDATE public.messages 
SET connection_name = conexoes.name
FROM public.conversations, public.conexoes
WHERE messages.conversa_id = conversations.id 
AND conexoes.whatsapp_contact = conversations.account
AND messages.connection_name IS NULL;

-- Comentário explicativo para futuras referências
COMMENT ON COLUMN public.messages.connection_account IS 'Armazena o identificador da conta/número usado para esta mensagem específica, preservando o histórico por mensagem';
COMMENT ON COLUMN public.messages.connection_name IS 'Armazena o nome da conexão usado para esta mensagem específica, preservando o histórico por mensagem';