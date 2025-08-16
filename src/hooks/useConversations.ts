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
  status: 'aberta' | 'fechada' // Status da conversa (aberta/fechada)
  channel: 'whatsapp' | 'instagram' | 'messenger' | null
  last_message: string | null
  last_message_at: string | null
  profile: string | null
  account: string | null
  unread_count: number
  have_agent: boolean
  status_agent: 'Ativo' | 'Inativo' | null
  created_at: string
  updated_at: string
}

export const useConversations = () => {
  const { user, userProfile } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Verificar se o usuário é admin
  const isAdmin = userProfile?.role === 'admin'

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
            status: 'ativo', // Status do contato
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

  useEffect(() => {
    if (user) {
      console.log('Usuário logado, carregando conversas...')
      console.log('Usuário é admin:', isAdmin)
      fetchConversations()
      
      // Configurar listener para realtime nas conversas
      const conversationsFilter = isAdmin ? 
        {} : // Admin vê todas as conversas
        { filter: `user_id=eq.${user.id}` } // Não-admin vê apenas suas conversas

      const conversationsChannel = supabase
        .channel('conversations-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'conversations',
            ...conversationsFilter
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
            
            setConversations(prev => [newConversation, ...prev])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            ...conversationsFilter
          },
          (payload) => {
            console.log('Conversa atualizada via realtime:', payload.new)
            setConversations(prev => 
              prev.map(conv => 
                conv.id === payload.new.id ? payload.new as Conversation : conv
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
                    const updatedConv = {
                      ...conv,
                      last_message: message.mensagem,
                      last_message_at: message.data_hora || message.created_at,
                      unread_count: conv.unread_count + 1
                    }
                    
                    // Se a conversa estiver fechada, reabrir automaticamente
                    if (conv.status === 'fechada') {
                      console.log('Reabrindo conversa fechada:', conv.id)
                      updatedConv.status = 'aberta'
                      
                      // Atualizar no banco de dados
                      supabase
                        .from('conversations')
                        .update({ status: 'aberta' })
                        .eq('id', conv.id)
                        .then(({ error }) => {
                          if (error) {
                            console.error('Erro ao reabrir conversa:', error)
                          } else {
                            console.log('Conversa reaberta com sucesso:', conv.id)
                          }
                        })
                    }
                    
                    return updatedConv
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
  }, [user, isAdmin])

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fazendo query no Supabase para conversas...')
      console.log('Buscando conversas como admin:', isAdmin)
      
      // Buscar conversas baseado no papel do usuário
      let conversationsQuery = supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
      
      // Se não for admin, filtrar apenas as conversas do usuário ou atribuídas a ele
      if (!isAdmin) {
        conversationsQuery = conversationsQuery.or(`user_id.eq.${user?.id},assigned_to.eq.${user?.id}`)
      }
      
      const { data: conversationsData, error: conversationsError } = await conversationsQuery
      
      if (conversationsError) {
        console.error('Erro na query de conversas:', conversationsError)
        throw conversationsError
      }
      
      console.log('Conversas retornadas:', conversationsData)
      
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

      // Para cada conversa, buscar a mensagem mais recente e contar não lidas
      const conversationsWithMessages = await Promise.all(
        conversationsData.map(async (conversation) => {
          try {
            // Buscar a mensagem mais recente desta conversa usando os novos nomes das colunas
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

            // Contar mensagens não lidas (recebidas após a última leitura do usuário)
            let unreadCount = 0
            if (user?.id) {
              // Verificar quando o usuário leu a conversa pela última vez
              const { data: readStatus } = await supabase
                .from('conversation_read_status')
                .select('last_read_at')
                .eq('user_id', user.id)
                .eq('conversation_id', conversation.id)
                .maybeSingle()

              const lastReadAt = readStatus?.last_read_at
              
              // Contar mensagens recebidas após a última leitura
              const countQuery = supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversa_id', conversation.id)
                .eq('direcao', 'received')
              
              if (lastReadAt) {
                countQuery.gt('data_hora', lastReadAt)
              }
              
              const { count } = await countQuery
              unreadCount = count || 0
            }

            return {
              ...conversation,
              status: (conversation.status === 'fechada' ? 'fechada' : 'aberta') as 'aberta' | 'fechada',
              last_message: lastMessage?.mensagem || conversation.last_message,
              last_message_at: lastMessage?.data_hora || conversation.last_message_at,
              profile: (conversation as any).profile || null,
              account: (conversation as any).account || null,
              have_agent: (conversation as any).have_agent || false,
              status_agent: (conversation as any).status_agent || null,
              unread_count: unreadCount
            }
          } catch (error) {
            console.error('Erro ao processar conversa:', error)
            return {
              ...conversation,
              status: (conversation.status === 'fechada' ? 'fechada' : 'aberta') as 'aberta' | 'fechada',
              last_message: conversation.last_message,
              last_message_at: conversation.last_message_at,
              profile: (conversation as any).profile || null,
              account: (conversation as any).account || null,
              have_agent: (conversation as any).have_agent || false,
              status_agent: (conversation as any).status_agent || null,
              unread_count: 0
            }
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
      console.log('Conversas processadas com mensagens:', sortedConversations)
      
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
      setConversations(prev => [{ 
        ...data, 
        status: (data.status === 'fechada' ? 'fechada' : 'aberta') as 'aberta' | 'fechada',
        profile: (data as any).profile || null, 
        account: (data as any).account || null,
        have_agent: (data as any).have_agent || false,
        status_agent: (data as any).status_agent || null
      }, ...prev])
      return data
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
      setError(error as Error)
      throw error
    }
  }

  const assignConversation = async (conversationId: string, newUserId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ user_id: newUserId })
        .eq('id', conversationId)
      
      if (error) throw error
      
      // Remove conversation from local state since it now belongs to another user
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      console.log(`Conversa ${conversationId} atribuída ao usuário ${newUserId}`)
    } catch (error) {
      console.error('Erro ao atribuir conversa:', error)
      setError(error as Error)
      throw error
    }
  }

  const markConversationAsRead = async (conversationId: string) => {
    try {
      if (!user?.id) return
      
      // Insert or update read status for this user and conversation
      const { error } = await supabase
        .from('conversation_read_status')
        .upsert({
          user_id: user.id,
          conversation_id: conversationId,
          last_read_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      // Update local state optimistically
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      ))
      
      console.log(`Conversa ${conversationId} marcada como lida`)
    } catch (error) {
      console.error('Erro ao marcar conversa como lida:', error)
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
    createConversation,
    assignConversation,
    markConversationAsRead,
    isDeleting,
    refetch: fetchConversations
  }
}
