-- Criar bucket para avatares
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Permitir que usuários autenticados façam upload de avatares
CREATE POLICY "Usuários podem fazer upload de avatares" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Permitir que usuários autenticados vejam avatares
CREATE POLICY "Usuários podem ver avatares" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Permitir que usuários autenticados atualizem seus próprios avatares
CREATE POLICY "Usuários podem atualizar seus próprios avatares" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Permitir que usuários autenticados deletem seus próprios avatares
CREATE POLICY "Usuários podem deletar seus próprios avatares" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');