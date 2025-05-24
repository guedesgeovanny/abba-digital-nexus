
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

export interface ContactTag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export const useContactTags = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['contact-tags', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('contact_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error
      return data as ContactTag[]
    },
    enabled: !!user?.id,
  })

  const createTagMutation = useMutation({
    mutationFn: async (tagData: { name: string; color?: string }) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('contact_tags')
        .insert({
          ...tagData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-tags'] })
      toast({
        title: "Tag criada",
        description: "A tag foi criada com sucesso",
      })
    },
    onError: (error) => {
      console.error('Error creating tag:', error)
      toast({
        title: "Erro ao criar tag",
        description: "Ocorreu um erro ao criar a tag",
        variant: "destructive",
      })
    },
  })

  const assignTagToContact = useMutation({
    mutationFn: async ({ contactId, tagId }: { contactId: string; tagId: string }) => {
      const { data, error } = await supabase
        .from('contact_tag_relations')
        .insert({
          contact_id: contactId,
          tag_id: tagId,
        })
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  const removeTagFromContact = useMutation({
    mutationFn: async ({ contactId, tagId }: { contactId: string; tagId: string }) => {
      const { error } = await supabase
        .from('contact_tag_relations')
        .delete()
        .eq('contact_id', contactId)
        .eq('tag_id', tagId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  return {
    tags,
    isLoading,
    createTag: createTagMutation.mutate,
    assignTagToContact: assignTagToContact.mutate,
    removeTagFromContact: removeTagFromContact.mutate,
    isCreatingTag: createTagMutation.isPending,
  }
}
