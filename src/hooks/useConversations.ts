import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export interface Conversation {
  id: string
  user_id: string
  contact_id: string | null
  contact_name: string
  contact_phone: string | null
  contact_username: string | null
  contact_avatar: string | null
  status: 'aberta' | 'fechada'
  channel: 'whatsapp' | 'instagram' | 'messenger' | null
  last_message: string | null
  last_message_at: string | null
  profile: string | null
  account: string | null
  unread_count: number
  have_agent: boolean
  status_agent: 'Ativo' | 'Inativo' | null
  assigned_to: string | null
  assigned_user?: {
    id: string
    full_name: string | null
    email: string
  } | null
  created_at: string
  updated_at: string
}

export const useConversations = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Função para sincronizar contato baseado nos dados da conversa
  const syncContactFromConversation = async (conversationData: {
    contact_name: string
    contact_phone?: string
    contact_username?: string
    contact_avatar?: string
    channel?: 'whatsapp' | 'instagram' | 'messenger'
  }) => {
    try {
      // Verificar se já existe um contato com o mesmo nome ou telefone
      let existingContact = null
      
      if (conversationData.contact_phone) {
        const { data } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user?.id)
          .eq('phone', conversationData.contact_phone)
          .maybeSingle()
        existingContact = data
      }
      
      if (!existingContact && conversationData.contact_username) {
        const { data } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user?.id)
          .ilike('name', conversationData.contact_name)
          .maybeSingle()
        existingContact = data
      }

      if (existingContact) {
        // Atualizar contato existente
        const { data: updatedContact, error } = await supabase
          .from('contacts')
          .update({
            name: conversationData.contact_name,
            phone: conversationData.contact_phone || existingContact.phone,
            channel: conversationData.channel || existingContact.channel,
            last_contact_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContact.id)
          .select()
          .single()
        
        if (error) throw error
        return updatedContact
      } else {
        // Criar novo contato
        const { data: newContact, error } = await supabase
          .from('contacts')
          .insert({
            user_id: user?.id,
            name: conversationData.contact_name,
            phone: conversationData.contact_phone,
            email: null,
            status: 'novo',
            channel: conversationData.channel || null,
            last_contact_date: new Date().toISOString(),
            notes: `Contato criado automaticamente via conversa ${conversationData.channel || 'chat'}`
          })
          .select()
          .single()
        
        if (error) throw error
        return newContact
      }
    } catch (error) {
      console.error('Erro ao sincronizar contato:', error)
      return null
    }
  }

  // Função para buscar dados do usuário atribuído
  const fetchAssignedUser = async (assignedTo: string | null) => {
    if (!assignedTo) return null
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', assignedTo)
        .single()
      
      if (error) {
        console.error('Erro ao buscar usuário atribuído:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Erro ao buscar usuário atribuído:', error)
      return null
    }
  }

  useEffect(() => {
    if (user) {
      console.log('Usuário logado, carregando conversas...', user.id)
      fetchConversations()
      
      // Configurar listener para realtime nas conversas
      const conversationsChannel = supabase
        .channel('conversations-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'conversations',
            filter: `user_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('Nova conversa recebida via realtime:', payload.new)
            const newConversation = payload.new as Conversation
            
            // Sincronizar contato para conversas recebidas via realtime
            if (newConversation.contact_name && !newConversation.contact_id) {
              const syncedContact = await syncContactFromConversation({
                contact_name: newConversation.contact_name,
                contact_phone: newConversation.contact_phone,
                contact_username: newConversation.contact_username,
                contact_avatar: newConversation.contact_avatar,
                channel: newConversation.channel
              })
              
              if (syncedContact) {
                // Atualizar a conversa com o contact_id sincronizado
                await supabase
                  .from('conversations')
                  .update({ contact_id: syncedContact.id })
                  .eq('id', newConversation.id)
                
                newConversation.contact_id = syncedContact.id
              }
            }
            
            // Buscar dados do usuário atribuído
            const assignedUser = await fetchAssignedUser(newConversation.assigned_to)
            newConversation.assigned_user = assignedUser
            
            setConversations(prev => [newConversation, ...prev])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            filter: `user_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('Conversa atualizada via realtime:', payload.new)
            const updatedConversation = payload.new as Conversation
            
            // Buscar dados do usuário atribuído se necessário
            const assignedUser = await fetchAssignedUser(updatedConversation.assigned_to)
            updatedConversation.assigned_user = assignedUser
            
            setConversations(prev => 
              prev.map(conv => 
                conv.id === updatedConversation.id ? updatedConversation : conv
              ).sort((a, b) => {
                const dateA = new Date(a.last_message_at || a.updated_at)
                const dateB = new Date(b.last_message_at || b.updated_at)
                return dateB.getTime() - dateA.getTime()
              })
            )
          }
        )
        .subscribe()

      // Configurar listener para realtime nas mensagens (para atualizar contadores)
      const messagesChannel = supabase
        .channel('messages-conversations-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          async (payload) => {
            console.log('Nova mensagem detectada para atualizar conversas:', payload.new)
            
            // Atualizar a conversa correspondente
            const message = payload.new
            if (message.direcao === 'received') {
              setConversations(prev => 
                prev.map(conv => {
                  if (conv.id === message.conversa_id) {
                    return {
                      ...conv,
                      last_message: message.mensagem,
                      last_message_at: message.data_hora || message.created_at,
                      unread_count: conv.unread_count + 1
                    }
                  }
                  return conv
                }).sort((a, b) => {
                  const dateA = new Date(a.last_message_at || a.updated_at)
                  const dateB = new Date(b.last_message_at || b.updated_at)
                  return dateB.getTime() - dateA.getTime()
                })
              )
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(conversationsChannel)
        supabase.removeChannel(messagesChannel)
      }
    } else {
      console.log('Usuário não logado')
      setConversations([])
      setIsLoading(false)
    }
  }, [user])

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fazendo query no Supabase para conversas...')
      console.log('User ID:', user?.id)
      
      // Buscar todas as conversas do usuário (query simplificada)
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
      
      if (conversationsError) {
        console.error('Erro na query de conversas:', conversationsError)
        throw conversationsError
      }
      
      console.log('Conversas retornadas:', conversationsData?.length || 0)
      
      if (!conversationsData || conversationsData.length === 0) {
        setConversations([])
        return
      }

      // Sincronizar contatos para conversas que não têm contact_id
      const conversationsToSync = conversationsData.filter(conv => 
        !conv.contact_id && conv.contact_name
      )
      
      if (conversationsToSync.length > 0) {
        console.log(`Sincronizando ${conversationsToSync.length} conversas sem contact_id...`)
        
        await Promise.all(
          conversationsToSync.map(async (conversation) => {
            try {
              const syncedContact = await syncContactFromConversation({
                contact_name: conversation.contact_name,
                contact_phone: conversation.contact_phone,
                contact_username: conversation.contact_username,
                contact_avatar: conversation.contact_avatar,
                channel: conversation.channel
              })
              
              if (syncedContact) {
                // Atualizar a conversa com o contact_id sincronizado
                await supabase
                  .from('conversations')
                  .update({ contact_id: syncedContact.id })
                  .eq('id', conversation.id)
                
                conversation.contact_id = syncedContact.id
                console.log(`Conversa ${conversation.id} sincronizada com contato ${syncedContact.id}`)
              }
            } catch (error) {
              console.error(`Erro ao sincronizar conversa ${conversation.id}:`, error)
            }
          })
        )
      }

      // Para cada conversa, buscar a mensagem mais recente, contar não lidas e buscar usuário atribuído
      const conversationsWithMessages = await Promise.all(
        conversationsData.map(async (conversation) => {
          try {
            // Buscar a mensagem mais recente desta conversa
            const { data: lastMessage, error: messageError } = await supabase
              .from('messages')
              .select('mensagem, data_hora, direcao')
              .eq('conversa_id', conversation.id)
              .order('data_hora', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (messageError) {
              console.error('Erro ao buscar última mensagem:', messageError)
            }

            // Contar mensagens não lidas (recebidas)
            const { count: unreadCount, error: countError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversa_id', conversation.id)
              .eq('direcao', 'received')

            if (countError) {
              console.error('Erro ao contar mensagens não lidas:', countError)
            }

            // Buscar dados do usuário atribuído
            const assignedUser = await fetchAssignedUser((conversation as any).assigned_to)

            return {
              ...conversation,
              last_message: lastMessage?.mensagem || conversation.last_message,
              last_message_at: lastMessage?.data_hora || conversation.last_message_at,
              profile: (conversation as any).profile || null,
              account: (conversation as any).account || null,
              have_agent: (conversation as any).have_agent || false,
              status_agent: (conversation as any).status_agent || null,
              assigned_to: (conversation as any).assigned_to || null,
              assigned_user: assignedUser,
              unread_count: unreadCount || 0
            } as Conversation
          } catch (error) {
            console.error('Erro ao processar conversa:', error)
            return {
              ...conversation,
              last_message: conversation.last_message,
              last_message_at: conversation.last_message_at,
              profile: (conversation as any).profile || null,
              account: (conversation as any).account || null,
              have_agent: (conversation as any).have_agent || false,
              status_agent: (conversation as any).status_agent || null,
              assigned_to: (conversation as any).assigned_to || null,
              assigned_user: null,
              unread_count: 0
            } as Conversation
          }
        })
      )

      // Ordenar por última mensagem (mais recente primeiro)
      const sortedConversations = conversationsWithMessages.sort((a, b) => {
        const dateA = new Date(a.last_message_at || a.updated_at)
        const dateB = new Date(b.last_message_at || b.updated_at)
        return dateB.getTime() - dateA.getTime()
      })

      setConversations(sortedConversations)
      console.log('Conversas processadas com mensagens:', sortedConversations.length)
      
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      setIsDeleting(true)

      // Deletar todas as mensagens da conversa primeiro usando o novo nome da coluna
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversa_id', conversationId)
      
      if (messagesError) {
        console.error('Erro ao deletar mensagens:', messagesError)
        throw messagesError
      }

      // Depois deletar a conversa
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
      
      if (conversationError) {
        console.error('Erro ao deletar conversa:', conversationError)
        throw conversationError
      }
      
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      console.log(`Conversa ${conversationId} e suas mensagens excluídas`)
    } catch (error) {
      console.error('Erro ao excluir conversa:', error)
      setError(error as Error)
    } finally {
      setIsDeleting(false)
    }
  }

  const updateConversationStatus = async (conversationId: string, status: 'aberta' | 'fechada') => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status })
        .eq('id', conversationId)
      
      if (error) throw error
      
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, status } : conv
      ))
      console.log(`Status da conversa ${conversationId} alterado para ${status}`)
    } catch (error) {
      console.error('Erro ao atualizar status da conversa:', error)
      setError(error as Error)
    }
  }

  const updateAgentStatus = async (conversationId: string, newStatus: 'Ativo' | 'Inativo') => {
    try {
      // Atualização otimista - atualiza o estado local primeiro
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, status_agent: newStatus } : conv
      ))

      const { error } = await supabase
        .from('conversations')
        .update({ status_agent: newStatus } as any)
        .eq('id', conversationId)

      if (error) {
        // Reverte a atualização otimista em caso de erro
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId ? { ...conv, status_agent: conv.status_agent === 'Ativo' ? 'Inativo' : 'Ativo' } : conv
        ))
        throw error
      }

      console.log(`Status do agente da conversa ${conversationId} alterado para ${newStatus}`)
    } catch (error) {
      console.error('Erro ao atualizar status do agente:', error)
      throw error
    }
  }

  const assignConversation = async (conversationId: string, userId: string | null) => {
    try {
      console.log('Atribuindo conversa:', conversationId, 'para usuário:', userId)
      
      const { error } = await supabase
        .from('conversations')
        .update({ assigned_to: userId } as any)
        .eq('id', conversationId)
      
      if (error) throw error
      
      // Buscar dados do usuário atribuído
      const assignedUser = await fetchAssignedUser(userId)
      
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, assigned_to: userId, assigned_user: assignedUser }
          : conv
      ))
      
      console.log(`Conversa ${conversationId} atribuída para ${userId || 'ninguém'}`)
    } catch (error) {
      console.error('Erro ao atribuir conversa:', error)
      setError(error as Error)
      throw error
    }
  }

  const createConversation = async (conversationData: {
    contact_id?: string
    contact_name: string
    contact_phone?: string
    contact_username?: string
    contact_avatar?: string
    channel?: 'whatsapp' | 'instagram' | 'messenger'
    last_message?: string
  }) => {
    try {
      console.log('Criando nova conversa:', conversationData)
      console.log('User ID:', user?.id)
      
      // Sincronizar contato primeiro
      const syncedContact = await syncContactFromConversation({
        contact_name: conversationData.contact_name,
        contact_phone: conversationData.contact_phone,
        contact_username: conversationData.contact_username,
        contact_avatar: conversationData.contact_avatar,
        channel: conversationData.channel
      })
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user?.id,
          contact_id: syncedContact?.id || conversationData.contact_id || null,
          contact_name: conversationData.contact_name,
          contact_phone: conversationData.contact_phone || null,
          contact_username: conversationData.contact_username || null,
          contact_avatar: conversationData.contact_avatar || null,
          channel: conversationData.channel || null,
          last_message: conversationData.last_message || null,
          last_message_at: new Date().toISOString(),
          status: 'aberta'
        })
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao inserir conversa:', error)
        throw error
      }
      
      console.log('Conversa criada com sucesso:', data)
      console.log('Contato sincronizado:', syncedContact)
      
      const newConversation: Conversation = { 
        ...data, 
        profile: (data as any).profile || null, 
        account: (data as any).account || null,
        have_agent: (data as any).have_agent || false,
        status_agent: (data as any).status_agent || null,
        assigned_to: (data as any).assigned_to || null,
        assigned_user: null
      }
      
      setConversations(prev => [newConversation, ...prev])
      return data
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
      setError(error as Error)
      throw error
    }
  }

  return {
    conversations,
    isLoading,
    error,
    deleteConversation,
    updateConversationStatus,
    updateAgentStatus,
    assignConversation,
    createConversation,
    isDeleting,
    refetch: fetchConversations
  }
}
