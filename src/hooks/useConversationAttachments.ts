import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface ConversationAttachment {
  id: string
  conversation_id: string
  media_file_id: string
  uploaded_by: string
  created_at: string
  media_file: {
    id: string
    filename: string
    original_filename: string | null
    mimetype: string
    url: string
    size_bytes: number | null
    extension: string | null
  }
}

export const useConversationAttachments = (conversationId: string | null) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch attachments for a conversation
  const { data: attachments, isLoading, error } = useQuery({
    queryKey: ['conversation-attachments', conversationId],
    queryFn: async () => {
      if (!conversationId) return []
      
      const { data, error } = await supabase
        .from('conversation_attachments')
        .select(`
          *,
          media_file:media_files (
            id,
            filename,
            original_filename,
            mimetype,
            url,
            size_bytes,
            extension
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as ConversationAttachment[]
    },
    enabled: !!conversationId,
  })

  // Upload new attachment
  const uploadAttachment = useMutation({
    mutationFn: async ({ file, conversationId }: { file: File; conversationId: string }) => {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `attachments/${fileName}`

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('arquivos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('arquivos')
        .getPublicUrl(filePath)

      // Save file info to media_files table
      const { data: mediaFile, error: mediaError } = await supabase
        .from('media_files')
        .insert({
          filename: fileName,
          original_filename: file.name,
          mimetype: file.type,
          url: publicUrl,
          size_bytes: file.size,
          extension: fileExt || null,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (mediaError) throw mediaError

      // Create conversation attachment link
      const { data: attachment, error: attachmentError } = await supabase
        .from('conversation_attachments')
        .insert({
          conversation_id: conversationId,
          media_file_id: mediaFile.id,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (attachmentError) throw attachmentError

      return attachment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-attachments', conversationId] })
      toast({
        title: "Arquivo anexado com sucesso",
        description: "O arquivo foi adicionado à conversa.",
      })
    },
    onError: (error) => {
      console.error('Error uploading attachment:', error)
      toast({
        title: "Erro ao anexar arquivo",
        description: "Não foi possível fazer upload do arquivo. Tente novamente.",
        variant: "destructive",
      })
    },
  })

  // Delete attachment
  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: string) => {
      // Get attachment details first
      const { data: attachment, error: fetchError } = await supabase
        .from('conversation_attachments')
        .select('media_file_id, media_file:media_files(filename)')
        .eq('id', attachmentId)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage
      const filename = attachment.media_file.filename
      await supabase.storage
        .from('arquivos')
        .remove([`attachments/${filename}`])

      // Delete media file record (this will cascade delete the attachment)
      const { error: deleteError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', attachment.media_file_id)

      if (deleteError) throw deleteError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-attachments', conversationId] })
      toast({
        title: "Arquivo removido",
        description: "O anexo foi removido da conversa.",
      })
    },
    onError: (error) => {
      console.error('Error deleting attachment:', error)
      toast({
        title: "Erro ao remover arquivo",
        description: "Não foi possível remover o anexo. Tente novamente.",
        variant: "destructive",
      })
    },
  })

  return {
    attachments: attachments || [],
    isLoading,
    error,
    uploadAttachment: uploadAttachment.mutate,
    deleteAttachment: deleteAttachment.mutate,
    isUploading: uploadAttachment.isPending,
    isDeleting: deleteAttachment.isPending,
  }
}