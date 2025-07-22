
import { useState } from 'react'
import { useConversations, Conversation } from '@/hooks/useConversations'
import { ConversationList } from '@/components/ConversationList'
import { ChatArea } from '@/components/ChatArea'
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default function Chat() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const { 
    conversations, 
    isLoading, 
    deleteConversation, 
    updateConversationStatus,
    assignConversation
  } = useConversations()

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversation(conversationId)
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null)
    }
  }

  const handleCloseConversation = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (conversation) {
      const newStatus = conversation.status === 'aberta' ? 'fechada' : 'aberta'
      await updateConversationStatus(conversationId, newStatus)
    }
  }

  const handleAssignConversation = async (conversationId: string, userId: string | null) => {
    await assignConversation(conversationId, userId)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-abba-bg text-abba-text">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b border-abba-border">
              <h2 className="text-xl font-semibold text-abba-text">Conversas</h2>
            </div>
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onCloseConversation={handleCloseConversation}
              onAssignConversation={handleAssignConversation}
              isLoading={isLoading}
            />
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <div className="border-b border-abba-border p-4 flex items-center">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-semibold">
              {selectedConversation ? selectedConversation.contact_name : 'Selecione uma conversa'}
            </h1>
          </div>
          
          <div className="flex-1">
            {selectedConversation ? (
              <ChatArea conversation={selectedConversation} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">Nenhuma conversa selecionada</p>
                  <p className="text-sm">Escolha uma conversa na lista para começar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
