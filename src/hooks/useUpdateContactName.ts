import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface UpdateContactNameParams {
  conversationId: string
  contactId?: string | null
  newName: string
}

export const useUpdateContactName = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ conversationId, contactId, newName }: UpdateContactNameParams) => {
      if (!newName.trim()) {
        throw new Error("Nome não pode estar vazio")
      }

      // Começar uma transação para atualizar ambas as tabelas
      const updates = []

      // 1. Atualizar conversation.contact_name
      const conversationUpdate = supabase
        .from('conversations')
        .update({ contact_name: newName.trim() })
        .eq('id', conversationId)

      updates.push(conversationUpdate)

      // 2. Se existe contact_id, atualizar também na tabela contacts
      if (contactId) {
        const contactUpdate = supabase
          .from('contacts')
          .update({ name: newName.trim() })
          .eq('id', contactId)

        updates.push(contactUpdate)

        // 3. Atualizar todas as outras conversas que referenciam o mesmo contato
        const otherConversationsUpdate = supabase
          .from('conversations')
          .update({ contact_name: newName.trim() })
          .eq('contact_id', contactId)
          .neq('id', conversationId)

        updates.push(otherConversationsUpdate)
      }

      // Executar todas as atualizações
      const results = await Promise.all(updates)

      // Verificar se alguma atualização falhou
      for (const result of results) {
        if (result.error) {
          throw new Error(result.error.message)
        }
      }

      return { conversationId, contactId, newName: newName.trim() }
    },
    onSuccess: (data) => {
      // Invalidar queries relevantes para atualização em tempo real
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      
      toast({
        title: "Nome atualizado",
        description: `Nome do contato alterado para "${data.newName}" com sucesso.`,
      })
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar nome do contato:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar nome do contato. Tente novamente.",
        variant: "destructive"
      })
    }
  })
}