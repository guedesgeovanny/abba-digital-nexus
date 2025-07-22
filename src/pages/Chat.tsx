
import { useState } from 'react'
import { ConversationList } from '@/components/ConversationList'
import { ChatArea } from '@/components/ChatArea'
import { useConversations } from '@/hooks/useConversations'
import { useToast } from '@/hooks/use-toast'

export default function Chat() {
  const { 
    conversations, 
    isLoading, 
    deleteConversation, 
    updateConversationStatus, 
    assignConversation,
    canAssignConversations
  } = useConversations()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const { toast } = useToast()

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId)
      toast({
        title: 'Conversa excluída',
        description: 'A conversa foi excluída com sucesso',
      })
      
      // Se a conversa excluída estava selecionada, limpar seleção
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a conversa',
        variant: 'destructive'
      })
    }
  }

  const handleCloseConversation = async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId)
      if (!conversation) return
      
      const newStatus = conversation.status === 'aberta' ? 'fechada' : 'aberta'
      await updateConversationStatus(conversationId, newStatus)
      
      toast({
        title: newStatus === 'fechada' ? 'Conversa fechada' : 'Conversa reaberta',
        description: `A conversa foi ${newStatus === 'fechada' ? 'fechada' : 'reaberta'} com sucesso`,
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status da conversa',
        variant: 'destructive'
      })
    }
  }

  const handleAssignConversation = async (conversationId: string, userId: string | null) => {
    try {
      await assignConversation(conversationId, userId)
    } catch (error) {
      throw error // O erro será tratado pelo componente AssignConversationDialog
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-abba-text">Conversas</h2>
        </div>
        <div className="overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            onDeleteConversation={handleDeleteConversation}
            onCloseConversation={handleCloseConversation}
            onAssignConversation={handleAssignConversation}
            canAssignConversations={canAssignConversations}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <div className="flex-1 bg-gray-50">
        {selectedConversation ? (
          <ChatArea conversation={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-lg">Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
