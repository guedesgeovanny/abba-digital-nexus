-- Adicionar políticas RLS para as tabelas que não têm políticas

-- Políticas para a tabela contacts
CREATE POLICY "Users can view their own contacts" 
ON public.contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
ON public.contacts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
ON public.contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para a tabela contact_tags
CREATE POLICY "Users can view their own contact tags" 
ON public.contact_tags 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.contacts 
  WHERE contacts.id = contact_tags.contact_id 
  AND contacts.user_id = auth.uid()
));

CREATE POLICY "Users can create contact tags for their contacts" 
ON public.contact_tags 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.contacts 
  WHERE contacts.id = contact_tags.contact_id 
  AND contacts.user_id = auth.uid()
));

CREATE POLICY "Users can update contact tags for their contacts" 
ON public.contact_tags 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.contacts 
  WHERE contacts.id = contact_tags.contact_id 
  AND contacts.user_id = auth.uid()
));

CREATE POLICY "Users can delete contact tags for their contacts" 
ON public.contact_tags 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.contacts 
  WHERE contacts.id = contact_tags.contact_id 
  AND contacts.user_id = auth.uid()
));

-- Políticas para a tabela conversation_attachments
CREATE POLICY "Users can view attachments from their conversations" 
ON public.conversation_attachments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE conversations.id = conversation_attachments.conversation_id 
  AND conversations.user_id = auth.uid()
));

CREATE POLICY "Users can create attachments for their conversations" 
ON public.conversation_attachments 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE conversations.id = conversation_attachments.conversation_id 
  AND conversations.user_id = auth.uid()
));

CREATE POLICY "Users can update attachments from their conversations" 
ON public.conversation_attachments 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE conversations.id = conversation_attachments.conversation_id 
  AND conversations.user_id = auth.uid()
));

CREATE POLICY "Users can delete attachments from their conversations" 
ON public.conversation_attachments 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE conversations.id = conversation_attachments.conversation_id 
  AND conversations.user_id = auth.uid()
));