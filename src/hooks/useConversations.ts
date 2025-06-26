
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export interface Conversation {
  id: string
  user_id: string
  agent_id: string | null
  contact_name: string
  contact_phone: string | null
  contact_username: string | null
  contact_avatar: string | null
  status: 'aberta' | 'fechada'
  channel: 'whatsapp' | 'instagram' | 'messenger' | null
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  created_at: string
  updated_at: string
}

// Dados mock para demonstração
const mockConversations: Conversation[] = [
  {
    id: '1',
    user_id: '00000000-0000-0000-0000-000000000000',
    agent_id: null,
    contact_name: 'Maryjane Guedes | Modelo Plus Size',
    contact_username: 'marypguedes',
    contact_phone: '(11) 99999-9999',
    contact_avatar: '/lovable-uploads/570c9d08-209d-4434-84a8-b9937859bc5e.png',
    status: 'aberta',
    channel: 'whatsapp',
    last_message: 'Maryjane enviou um anexo',
    last_message_at: new Date().toISOString(),
    unread_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: '00000000-0000-0000-0000-000000000000',
    agent_id: null,
    contact_name: 'Eduardo Martins',
    contact_username: 'eduardo.martins',
    contact_phone: '(11) 88888-8888',
    contact_avatar: '/placeholder.svg',
    status: 'aberta',
    channel: 'whatsapp',
    last_message: 'Obrigado pelo atendimento!',
    last_message_at: new Date(Date.now() - 300000).toISOString(), // 5 min ago
    unread_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: '00000000-0000-0000-0000-000000000000',
    agent_id: null,
    contact_name: 'Antonio Neto',
    contact_username: 'antonio.neto',
    contact_phone: '(11) 77777-7777',
    contact_avatar: '/placeholder.svg',
    status: 'aberta',
    channel: 'whatsapp',
    last_message: 'Quando posso agendar?',
    last_message_at: new Date(Date.now() - 600000).toISOString(), // 10 min ago
    unread_count: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    user_id: '00000000-0000-0000-0000-000000000000',
    agent_id: null,
    contact_name: 'Marcelo Maia',
    contact_username: 'marcelo.maia',
    contact_phone: '(11) 66666-6666',
    contact_avatar: '/placeholder.svg',
    status: 'fechada',
    channel: 'whatsapp',
    last_message: 'Você: 😄😄',
    last_message_at: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    unread_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    user_id: '00000000-0000-0000-0000-000000000000',
    agent_id: null,
    contact_name: 'Thays Campos',
    contact_username: 'thays.campos',
    contact_phone: '(11) 55555-5555',
    contact_avatar: '/placeholder.svg',
    status: 'aberta',
    channel: 'whatsapp',
    last_message: 'Perfeito, obrigada!',
    last_message_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    unread_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    user_id: '00000000-0000-0000-0000-000000000000',
    agent_id: null,
    contact_name: 'Carlos Silva',
    contact_username: 'carlos.silva',
    contact_phone: '(11) 44444-4444',
    contact_avatar: '/placeholder.svg',
    status: 'aberta',
    channel: 'instagram',
    last_message: 'Gostei muito do produto!',
    last_message_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    unread_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    user_id: '00000000-0000-0000-0000-000000000000',
    agent_id: null,
    contact_name: 'Ana Costa',
    contact_username: 'ana.costa',
    contact_phone: '(11) 33333-3333',
    contact_avatar: '/placeholder.svg',
    status: 'fechada',
    channel: 'messenger',
    last_message: 'Problema resolvido, obrigada!',
    last_message_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    unread_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const useConversations = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (user) {
      // Simular carregamento
      setTimeout(() => {
        setConversations(mockConversations)
        setIsLoading(false)
      }, 500)
    } else {
      setConversations([])
      setIsLoading(false)
    }
  }, [user])

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    console.log(`Conversa ${conversationId} excluída`)
  }

  const updateConversationStatus = (conversationId: string, status: 'aberta' | 'fechada') => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, status } : conv
    ))
    console.log(`Status da conversa ${conversationId} alterado para ${status}`)
  }

  return {
    conversations,
    isLoading,
    error,
    deleteConversation,
    updateConversationStatus,
    isDeleting: false
  }
}
