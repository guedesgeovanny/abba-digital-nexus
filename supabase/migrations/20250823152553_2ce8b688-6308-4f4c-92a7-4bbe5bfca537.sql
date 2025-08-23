-- Add file_url column to messages table to support attachments
ALTER TABLE public.messages 
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_type TEXT,
ADD COLUMN file_size INTEGER;

-- Create RLS policies for the arquivos bucket if they don't exist
DO $$
BEGIN
    -- Check if the policy already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users to upload files'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload files" 
        ON storage.objects 
        FOR INSERT 
        WITH CHECK (bucket_id = 'arquivos' AND auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow users to view their own files'
    ) THEN
        CREATE POLICY "Allow users to view their own files" 
        ON storage.objects 
        FOR SELECT 
        USING (bucket_id = 'arquivos' AND auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow users to delete their own files'
    ) THEN
        CREATE POLICY "Allow users to delete their own files" 
        ON storage.objects 
        FOR DELETE 
        USING (bucket_id = 'arquivos' AND auth.uid() IS NOT NULL);
    END IF;
END
$$;