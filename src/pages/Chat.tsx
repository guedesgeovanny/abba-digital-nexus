import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, RefreshCw } from "lucide-react"
import { ConversationList } from "@/components/ConversationList"
import { ChatArea } from "@/components/ChatArea"
import { AccountFilter } from "@/components/AccountFilter"
import { useConversations, Conversation } from "@/hooks/useConversations"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useLocation } from "react-router-dom"
import { useEffect } from "react"

const Chat = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("geral")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isCreatingSample, setIsCreatingSample] = useState(false)
  const { conversations, isLoading, deleteConversation, updateConversationStatus, updateAgentStatus, assignConversation, markConversationAsRead, isDeleting, refetch } = useConversations()
  const { user } = useAuth()
  const { toast } = useToast()

  // Auto-select conversation if navigated from CRM
  useEffect(() => {
    if (location.state?.selectedConversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === location.state.selectedConversationId)
      if (conversation) {
        setSelectedConversation(conversation)
      }
    }
  }, [location.state, conversations])

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (conversation.contact_username && conversation.contact_username.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesAccount = selectedAccount === "all" || conversation.account === selectedAccount
    
    // Debug logging
    console.log('Filtering conversation:', {
      name: conversation.contact_name,
      account: conversation.account,
      selectedAccount,
      matchesAccount
    })
    
    if (activeTab === "geral") return matchesSearch && matchesAccount
    if (activeTab === "aberto") return matchesSearch && matchesAccount && conversation.status === "aberta"
    if (activeTab === "fechado") return matchesSearch && matchesAccount && conversation.status === "fechada"
    
    return matchesSearch && matchesAccount
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
    
    toast({
      title: "Conversa excluída",
      description: "A conversa e todas as suas mensagens foram excluídas com sucesso.",
    })
    
    console.log(`Conversa ${conversationId} excluída com sucesso`)
  }

  const handleCloseConversation = async (conversationId: string) => {
    try {
      await updateConversationStatus(conversationId, 'fechada')
      
      // Atualizar a conversa selecionada se for a mesma
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, status: 'fechada' } : null)
      }
      
      toast({
        title: "Conversa fechada",
        description: "A conversa foi fechada com sucesso.",
      })
      
      console.log(`Conversa ${conversationId} fechada com sucesso`)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fechar a conversa. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const handleToggleConversationStatus = async (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId)
    if (!conversation) return

    const newStatus = conversation.status === 'aberta' ? 'fechada' : 'aberta'
    
    try {
      await updateConversationStatus(conversationId, newStatus)
      
      // Atualizar a conversa selecionada se for a mesma
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, status: newStatus } : null)
      }
      
      toast({
        title: newStatus === 'fechada' ? "Conversa fechada" : "Conversa aberta",
        description: `A conversa foi ${newStatus === 'fechada' ? 'fechada' : 'reaberta'} com sucesso.`,
      })
      
      console.log(`Conversa ${conversationId} ${newStatus === 'fechada' ? 'fechada' : 'reaberta'} com sucesso`)
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${newStatus === 'fechada' ? 'fechar' : 'reabrir'} a conversa. Tente novamente.`,
        variant: "destructive"
      })
    }
  }

  const handleUpdateAgentStatus = async (conversationId: string, newStatus: 'Ativo' | 'Inativo') => {
    try {
      await updateAgentStatus(conversationId, newStatus)
      
      // Atualizar a conversa selecionada se for a mesma
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, status_agent: newStatus } : null)
      }
    } catch (error) {
      console.error('Erro ao atualizar status do agente:', error)
      throw error // Re-throw para o componente ChatArea tratar
    }
  }

  const createSampleConversations = async () => {
    try {
      setIsCreatingSample(true)
      console.log('Criando conversas de exemplo...')
      
      const { error } = await supabase.rpc('create_sample_conversations')
      
      if (error) {
        console.error('Erro ao criar conversas de exemplo:', error)
        toast({
          title: "Erro",
          description: "Erro ao criar conversas de exemplo: " + error.message,
          variant: "destructive"
        })
        return
      }
      
      console.log('Conversas de exemplo criadas com sucesso')
      toast({
        title: "Sucesso",
        description: "Conversas de exemplo criadas com sucesso!",
      })
      
      // Recarregar conversas
      refetch()
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar conversas de exemplo",
        variant: "destructive"
      })
    } finally {
      setIsCreatingSample(false)
    }
  }

  // Selecionar automaticamente a primeira conversa se nenhuma estiver selecionada
  if (!selectedConversation && conversations.length > 0 && !isLoading) {
    setSelectedConversation(conversations[0])
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <p className="text-muted-foreground">Você precisa estar logado para ver as conversas</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar de conversas */}
        <div className="w-96 bg-card border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Chat</h2>
              {conversations.length === 0 && !isLoading && (
                <Button
                  onClick={createSampleConversations}
                  disabled={isCreatingSample}
                  size="sm"
                  className="bg-abba-green text-abba-black hover:bg-abba-green/90"
                >
                  {isCreatingSample ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    "Criar Exemplos"
                  )}
                </Button>
              )}
            </div>
            
            {/* Campo de busca */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border text-foreground focus:border-abba-green"
              />
            </div>

            {/* Filtro por Account */}
            <div className="mb-4">
              <AccountFilter 
                selectedAccount={selectedAccount}
                onAccountChange={setSelectedAccount}
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger 
                  value="geral" 
                  className="text-foreground data-[state=active]:bg-abba-green data-[state=active]:text-abba-black"
                >
                  Geral
                </TabsTrigger>
                <TabsTrigger 
                  value="aberto"
                  className="text-foreground data-[state=active]:bg-abba-green data-[state=active]:text-abba-black"
                >
                  Em Aberto
                </TabsTrigger>
                <TabsTrigger 
                  value="fechado"
                  className="text-foreground data-[state=active]:bg-abba-green data-[state=active]:text-abba-black"
                >
                  Fechadas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Lista de conversas */}
          <ScrollArea className="flex-1">
                    <ConversationList
                      conversations={filteredConversations}
                      selectedConversation={selectedConversation}
                      onSelectConversation={handleSelectConversation}
                      onDeleteConversation={handleDeleteConversation}
                      onCloseConversation={handleToggleConversationStatus}
                      onAssignConversation={assignConversation}
                      onMarkAsRead={markConversationAsRead}
                      isLoading={isLoading}
                    />
          </ScrollArea>
        </div>

        {/* Área do chat */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ChatArea 
              conversation={selectedConversation} 
              onDeleteConversation={handleDeleteConversation}
              onUpdateAgentStatus={handleUpdateAgentStatus}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-background">
              <p className="text-muted-foreground">
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
