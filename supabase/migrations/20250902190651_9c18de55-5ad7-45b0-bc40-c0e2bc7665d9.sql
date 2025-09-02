-- Create indexes to improve conversation loading performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON public.conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_assigned ON public.conversations(user_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_status_updated ON public.conversations(status, updated_at DESC);

-- Messages table indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_conversa_id ON public.messages(conversa_id);
CREATE INDEX IF NOT EXISTS idx_messages_data_hora ON public.messages(data_hora DESC);
CREATE INDEX IF NOT EXISTS idx_messages_direcao ON public.messages(direcao);
CREATE INDEX IF NOT EXISTS idx_messages_conversa_data ON public.messages(conversa_id, data_hora DESC);

-- Conversation read status indexes
CREATE INDEX IF NOT EXISTS idx_conversation_read_status_user_conversation ON public.conversation_read_status(user_id, conversation_id);

-- Contacts table indexes
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts(name);

-- Enable statement timeout optimization
SET statement_timeout = '30s';