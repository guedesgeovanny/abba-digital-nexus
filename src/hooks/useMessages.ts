import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export interface Message {
  numero: number
  conversa_id: string
  mensagem: string
  direcao: 'sent' | 'received'
  nome_contato: string | null
  data_hora: string | null
  created_at: string
  updated_at: string | null
  mensagem_is_agent?: boolean
  connection_account?: string | null
  connection_name?: string | null
  file_url?: string | null
  file_name?: string | null
  file_type?: string | null
  file_size?: number | null
}

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    if (conversationId && user) {
      console.log('Carregando mensagens para conversa:', conversationId)
      fetchMessages()
      
      // Configurar listener para realtime
      const channel = supabase
        .channel('messages-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversa_id=eq.${conversationId}`
          },
          (payload) => {
            console.log('Nova mensagem recebida via realtime:', payload.new)
            const newMessage: Message = payload.new as Message
            setMessages(prev => [...prev, newMessage])
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      console.log('Sem conversa selecionada ou usuário não logado')
      setMessages([])
      setIsLoading(false)
    }
  }, [conversationId, user])

  const fetchMessages = async () => {
    if (!conversationId) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fazendo query de mensagens...')
      
      // Buscar mensagens usando os novos nomes das colunas
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversa_id', conversationId)
        .order('data_hora', { ascending: true })
      
      if (error) {
        console.error('Erro na query de mensagens:', error)
        throw error
      }
      
      console.log('Mensagens retornadas:', data)
      
      // Garantir que os tipos sejam corretos
      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        direcao: msg.direcao as 'sent' | 'received',
        mensagem_is_agent: (msg as any).mensagem_is_agent || false
      }))
      
      setMessages(typedMessages)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendToWebhook = async (messageData: any) => {
    try {
      console.log('Enviando mensagem para webhook:', messageData)
      
        const response = await fetch('https://webhock-veterinup.abbadigital.com.br/webhook/envia-mensagem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData)
        })

      if (!response.ok) {
        throw new Error(`Webhook responded with status: ${response.status}`)
      }

      console.log('Mensagem enviada para webhook com sucesso')
    } catch (error) {
      console.error('Erro ao enviar mensagem para webhook:', error)
      // Não bloquear o envio da mensagem se o webhook falhar
    }
  }

  const sendMessage = async ({ 
    content, 
    connectionName, 
    file 
  }: { 
    content: string, 
    connectionName?: string,
    file?: File 
  }) => {
    if (!conversationId || !user) {
      console.error('Conversa ou usuário não disponível')
      return
    }

    try {
      setIsSending(true)
      console.log('Enviando mensagem:', { content, conversationId, file: file?.name })
      
      let fileData = null
      
      // Upload do arquivo se fornecido
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('arquivos')
          .upload(filePath, file)
        
        if (uploadError) {
          console.error('Erro ao fazer upload do arquivo:', uploadError)
          throw uploadError
        }
        
        // Obter URL público do arquivo
        const { data: urlData } = supabase.storage
          .from('arquivos')
          .getPublicUrl(filePath)
        
        fileData = {
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size
        }
        
        console.log('Arquivo uploaded:', fileData)
      }
      
      // Buscar dados da conversa para o webhook
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (convError) {
        console.error('Erro ao buscar conversa:', convError)
      }
      
      // Inserir a nova mensagem usando os novos nomes das colunas
      const insertData: any = {
        conversa_id: conversationId,
        mensagem: content,
        direcao: 'sent' as const,
        nome_contato: 'Você',
        data_hora: new Date().toISOString(),
        connection_name: connectionName || null,
        connection_account: conversation?.account || null,
        ...fileData
      }
      
      // Adicionar mensagem_is_agent se a coluna existir
      try {
        insertData.mensagem_is_agent = false
      } catch (e) {
        // Ignorar se a coluna não existir
      }
      
      const { data: newMessage, error: messageError } = await supabase
        .from('messages')
        .insert(insertData)
        .select()
        .single()
      
      if (messageError) {
        console.error('Erro ao inserir mensagem:', messageError)
        throw messageError
      }
      
      console.log('Mensagem inserida:', newMessage)
      
      // Atualizar a última mensagem da conversa
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId)
      
      if (conversationError) {
        console.error('Erro ao atualizar conversa:', conversationError)
        throw conversationError
      }
      
      console.log('Conversa atualizada')
      
      // Enviar dados para o webhook
      if (conversation) {
        const webhookData = {
          messageId: newMessage.numero,
          conversationId: conversationId,
          content: content,
          direction: 'sent',
          timestamp: new Date().toISOString(),
          contact: {
            name: conversation.contact_name,
            phone: conversation.contact_phone,
            username: conversation.contact_username
          },
          channel: conversation.channel,
          connectionName: connectionName,
          userId: user.id,
          ...(fileData && {
            attachment: {
              file_url: fileData.file_url,
              file_name: fileData.file_name,
              file_type: fileData.file_type,
              file_size: fileData.file_size
            }
          })
        }
        
        // Enviar para webhook sem bloquear a UI
        sendToWebhook(webhookData)
      }
      
      console.log('Mensagem enviada com sucesso:', content)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setError(error as Error)
    } finally {
      setIsSending(false)
    }
  }

  const clearMessages = async () => {
    if (!conversationId) {
      console.error('Conversa não disponível para limpar mensagens')
      return
    }

    try {
      setIsClearing(true)
      console.log('Limpando mensagens da conversa:', conversationId)
      
      // Deletar todas as mensagens da conversa
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('conversa_id', conversationId)
      
      if (error) {
        console.error('Erro ao limpar mensagens:', error)
        throw error
      }
      
      // Atualizar a conversa para remover a última mensagem
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({
          last_message: null,
          last_message_at: null
        })
        .eq('id', conversationId)
      
      if (conversationError) {
        console.error('Erro ao atualizar conversa:', conversationError)
        throw conversationError
      }
      
      setMessages([])
      console.log('Mensagens limpas com sucesso')
    } catch (error) {
      console.error('Erro ao limpar mensagens:', error)
      setError(error as Error)
    } finally {
      setIsClearing(false)
    }
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    isSending,
    clearMessages,
    isClearing,
    refetch: fetchMessages
  }
}
