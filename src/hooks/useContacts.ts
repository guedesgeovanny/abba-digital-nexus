
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

export interface Contact {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  instagram?: string
  company?: string
  position?: string
  address?: string
  notes?: string
  status: 'novo' | 'em_andamento' | 'qualificado' | 'convertido' | 'perdido'
  channel?: 'instagram' | 'whatsapp' | 'messenger' | 'email' | 'telefone' | 'site' | 'indicacao'
  source?: string
  agent_assigned?: string
  last_contact_date?: string
  value?: number
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  name: string
  status: string
}

export interface ContactTag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface ContactWithTags extends Contact {
  tags: ContactTag[]
  agent?: Agent
}

export const useContacts = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ['contacts', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          contact_tag_relations (
            contact_tags (
              id,
              user_id,
              name,
              color,
              created_at
            )
          ),
          agents (
            id,
            name,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to include tags and agent properly
      return data.map(contact => ({
        ...contact,
        tags: contact.contact_tag_relations?.map(rel => rel.contact_tags).filter(Boolean) || [],
        agent: contact.agents || undefined
      })) as ContactWithTags[]
    },
    enabled: !!user?.id,
  })

  const createContactMutation = useMutation({
    mutationFn: async (contactData: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast({
        title: "Contato criado",
        description: "O contato foi criado com sucesso",
      })
    },
    onError: (error) => {
      console.error('Error creating contact:', error)
      toast({
        title: "Erro ao criar contato",
        description: "Ocorreu um erro ao criar o contato",
        variant: "destructive",
      })
    },
  })

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contact> & { id: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast({
        title: "Contato atualizado",
        description: "O contato foi atualizado com sucesso",
      })
    },
    onError: (error) => {
      console.error('Error updating contact:', error)
      toast({
        title: "Erro ao atualizar contato",
        description: "Ocorreu um erro ao atualizar o contato",
        variant: "destructive",
      })
    },
  })

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast({
        title: "Contato excluído",
        description: "O contato foi excluído com sucesso",
      })
    },
    onError: (error) => {
      console.error('Error deleting contact:', error)
      toast({
        title: "Erro ao excluir contato",
        description: "Ocorreu um erro ao excluir o contato",
        variant: "destructive",
      })
    },
  })

  return {
    contacts,
    isLoading,
    error,
    createContact: createContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
    isCreating: createContactMutation.isPending,
    isUpdating: updateContactMutation.isPending,
    isDeleting: deleteContactMutation.isPending,
  }
}
