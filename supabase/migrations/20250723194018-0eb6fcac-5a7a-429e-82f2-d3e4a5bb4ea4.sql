-- Update RLS policies for messages table to allow admin access
-- Following the same pattern as conversations table

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON public.messages;

-- Create new policies with admin access
CREATE POLICY "Users can view messages from their conversations and assigned ones"
    ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversa_id
            AND (
                conversations.user_id = auth.uid() 
                OR conversations.assigned_to = auth.uid()
                OR (SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin'
            )
        )
    );

CREATE POLICY "Users can create messages in their conversations"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversa_id
            AND (
                conversations.user_id = auth.uid() 
                OR conversations.assigned_to = auth.uid()
                OR (SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin'
            )
        )
    );

CREATE POLICY "Users can update messages in their conversations"
    ON public.messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversa_id
            AND (
                conversations.user_id = auth.uid() 
                OR conversations.assigned_to = auth.uid()
                OR (SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin'
            )
        )
    );

CREATE POLICY "Users can delete messages from their conversations"
    ON public.messages
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversa_id
            AND (
                conversations.user_id = auth.uid() 
                OR conversations.assigned_to = auth.uid()
                OR (SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin'
            )
        )
    );