
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { ConversationList } from "@/components/ConversationList"
import { ChatArea } from "@/components/ChatArea"
import { useConversations, Conversation } from "@/hooks/useConversations"
import { useAuth } from "@/contexts/AuthContext"

const Chat = () => {
  const [activeTab, setActiveTab] = useState("geral")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const { conversations, isLoading, deleteConversation, isDeleting } = useConversations()
  const { user } = useAuth()

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (conversation.contact_username && conversation.contact_username.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (activeTab === "geral") return matchesSearch
    if (activeTab === "aberto") return matchesSearch && conversation.status === "aberta"
    if (activeTab === "fechado") return matchesSearch && conversation.status === "fechada"
    
    return matchesSearch
  })

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversation(conversationId)
    
    // Se a conversa excluída era a selecionada, seleciona a primeira disponível
    if (selectedConversation?.id === conversationId) {
      const remainingConversations = conversations.filter(conv => conv.id !== conversationId)
      setSelectedConversation(remainingConversations.length > 0 ? remainingConversations[0] : null)
    }
    
    console.log(`Conversa ${conversationId} excluída com sucesso`)
  }

  // Selecionar automaticamente a primeira conversa se nenhuma estiver selecionada
  if (!selectedConversation && conversations.length > 0 && !isLoading) {
    setSelectedConversation(conversations[0])
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-abba-black">
        <p className="text-gray-400">Você precisa estar logado para ver as conversas</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-abba-black text-abba-text">
      <div className="flex h-full">
        {/* Sidebar de conversas */}
        <div className="w-96 bg-abba-black border-r border-abba-gray flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-abba-gray">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-abba-text">Chat</h2>
            </div>
            
            {/* Campo de busca */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-abba-gray">
                <TabsTrigger 
                  value="geral" 
                  className="data-[state=active]:bg-abba-green data-[state=active]:text-abba-black"
                >
                  Geral
                </TabsTrigger>
                <TabsTrigger 
                  value="aberto"
                  className="data-[state=active]:bg-abba-green data-[state=active]:text-abba-black"
                >
                  Em Aberto
                </TabsTrigger>
                <TabsTrigger 
                  value="fechado"
                  className="data-[state=active]:bg-abba-green data-[state=active]:text-abba-black"
                >
                  Fechadas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Lista de conversas */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList 
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Área do chat */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ChatArea 
              conversation={selectedConversation} 
              onDeleteConversation={handleDeleteConversation}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-abba-black">
              <p className="text-gray-400">
                {isLoading ? 'Carregando conversas...' : 'Selecione uma conversa para começar'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat
