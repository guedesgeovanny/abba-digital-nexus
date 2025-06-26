
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export interface Message {
  id: string
  conversation_id: string
  content: string
  direction: 'sent' | 'received'
  message_type: 'text' | 'image' | 'audio' | 'document' | 'file'
  sender_name: string | null
  read_at: string | null
  created_at: string
}

// Dados mock para demonstração
const mockMessages: { [conversationId: string]: Message[] } = {
  '1': [
    {
      id: '1-1',
      conversation_id: '1',
      content: 'Olá! Estou interessada nos seus serviços.',
      direction: 'received',
      message_type: 'text',
      sender_name: 'Maryjane Guedes',
      read_at: null,
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: '1-2',
      conversation_id: '1',
      content: 'Oi Maryjane! Fico feliz com o seu interesse. Como posso te ajudar?',
      direction: 'sent',
      message_type: 'text',
      sender_name: 'Você',
      read_at: null,
      created_at: new Date(Date.now() - 1500000).toISOString()
    },
    {
      id: '1-3',
      conversation_id: '1',
      content: 'Maryjane enviou um anexo',
      direction: 'received',
      message_type: 'file',
      sender_name: 'Maryjane Guedes',
      read_at: null,
      created_at: new Date().toISOString()
    }
  ],
  '2': [
    {
      id: '2-1',
      conversation_id: '2',
      content: 'Bom dia! Preciso de ajuda com um problema técnico.',
      direction: 'received',
      message_type: 'text',
      sender_name: 'Eduardo Martins',
      read_at: null,
      created_at: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: '2-2',
      conversation_id: '2',
      content: 'Claro! Pode me explicar qual é o problema?',
      direction: 'sent',
      message_type: 'text',
      sender_name: 'Você',
      read_at: null,
      created_at: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: '2-3',
      conversation_id: '2',
      content: 'Obrigado pelo atendimento!',
      direction: 'received',
      message_type: 'text',
      sender_name: 'Eduardo Martins',
      read_at: null,
      created_at: new Date(Date.now() - 300000).toISOString()
    }
  ],
  '3': [
    {
      id: '3-1',
      conversation_id: '3',
      content: 'Oi! Gostaria de agendar uma consulta.',
      direction: 'received',
      message_type: 'text',
      sender_name: 'Antonio Neto',
      read_at: null,
      created_at: new Date(Date.now() - 1200000).toISOString()
    },
    {
      id: '3-2',
      conversation_id: '3',
      content: 'Perfeito! Temos disponibilidade essa semana.',
      direction: 'sent',
      message_type: 'text',
      sender_name: 'Você',
      read_at: null,
      created_at: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: '3-3',
      conversation_id: '3',
      content: 'Quando posso agendar?',
      direction: 'received',
      message_type: 'text',
      sender_name: 'Antonio Neto',
      read_at: null,
      created_at: new Date(Date.now() - 600000).toISOString()
    }
  ]
}

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (conversationId && user) {
      setIsLoading(true)
      // Simular carregamento
      setTimeout(() => {
        const conversationMessages = mockMessages[conversationId] || []
        setMessages(conversationMessages)
        setIsLoading(false)
      }, 300)
    } else {
      setMessages([])
      setIsLoading(false)
    }
  }, [conversationId, user])

  const sendMessage = ({ content, messageType = 'text' }: { content: string, messageType?: Message['message_type'] }) => {
    if (!conversationId || !user) return

    setIsSending(true)
    
    // Simular envio de mensagem
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        conversation_id: conversationId,
        content,
        direction: 'sent',
        message_type: messageType,
        sender_name: 'Você',
        read_at: null,
        created_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, newMessage])
      
      // Atualizar mock messages para persistir
      if (!mockMessages[conversationId]) {
        mockMessages[conversationId] = []
      }
      mockMessages[conversationId].push(newMessage)
      
      setIsSending(false)
      console.log('Mensagem enviada:', content)
    }, 500)
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    isSending
  }
}
