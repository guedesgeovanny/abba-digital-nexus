-- Create conversation_attachments table to link files to conversations
CREATE TABLE public.conversation_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  media_file_id UUID NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.conversation_attachments 
ADD CONSTRAINT fk_conversation_attachments_conversation 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

ALTER TABLE public.conversation_attachments 
ADD CONSTRAINT fk_conversation_attachments_media_file 
FOREIGN KEY (media_file_id) REFERENCES public.media_files(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.conversation_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversation_attachments
CREATE POLICY "Users can view attachments of their conversations" 
ON public.conversation_attachments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = conversation_attachments.conversation_id 
    AND (
      conversations.user_id = auth.uid() 
      OR conversations.assigned_to = auth.uid() 
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
  )
);

CREATE POLICY "Users can create attachments for their conversations" 
ON public.conversation_attachments 
FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by AND
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = conversation_attachments.conversation_id 
    AND (
      conversations.user_id = auth.uid() 
      OR conversations.assigned_to = auth.uid() 
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
  )
);

CREATE POLICY "Users can delete attachments they uploaded" 
ON public.conversation_attachments 
FOR DELETE 
USING (
  auth.uid() = uploaded_by OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Create index for better performance
CREATE INDEX idx_conversation_attachments_conversation_id ON public.conversation_attachments(conversation_id);
CREATE INDEX idx_conversation_attachments_media_file_id ON public.conversation_attachments(media_file_id);