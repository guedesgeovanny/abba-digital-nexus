import { useState } from "react"
import { useAgents } from "@/hooks/useAgents"
import { AgentsPageHeader } from "@/components/AgentsPageHeader"
import { AgentSearch } from "@/components/AgentSearch"
import { AgentsList } from "@/components/AgentsList"
import { EmptyAgentsState } from "@/components/EmptyAgentsState"
import { CreateAgentDialog } from "@/components/CreateAgentDialog"
import { Tables } from "@/integrations/supabase/types"
import { useToast } from "@/hooks/use-toast"

type Agent = Tables<'agents'>

const Agents = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null)
  const { toast } = useToast()
  
  const { 
    agents, 
    isLoading, 
    createAgent, 
    updateAgent,
    deleteAgent, 
    isCreating,
    isUpdating,
    isDeleting
  } = useAgents()

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agent.description && agent.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCreateAgent = (agentData: Parameters<typeof createAgent>[0] & {
    whatsapp_profile_name?: string
    whatsapp_contact?: string
    whatsapp_profile_picture_url?: string
    whatsapp_profile_picture_data?: string
  }) => {
    console.log('📤 Criando agente com dados do WhatsApp:', agentData)
    
    createAgent(agentData, {
      onSuccess: (newAgent) => {
        console.log('✅ Agente criado com ID real:', newAgent.id)
        setCreatedAgentId(newAgent.id)
        
        // Só fechar o dialog se não for WhatsApp ou se o WhatsApp já estiver conectado
        if (agentData.channel !== 'whatsapp' || agentData.whatsapp_contact) {
          setIsCreateDialogOpen(false)
          toast({
            title: "Agente criado com sucesso!",
            description: `O agente ${agentData.name} foi criado${agentData.whatsapp_contact ? ' e o WhatsApp foi conectado' : ''}.`,
          })
        }

        return newAgent
      },
      onError: (error) => {
        toast({
          title: "Erro ao criar agente",
          description: "Ocorreu um erro ao criar o agente. Tente novamente.",
          variant: "destructive",
        })
        console.error("Error creating agent:", error)
      }
    })
  }

  const handleEditAgent = (agent: Agent) => {
    console.log("Edit agent:", agent)
  }

  const handleDeleteAgent = (id: string) => {
    deleteAgent(id, {
      onSuccess: () => {
        toast({
          title: "Agente excluído",
          description: "O agente foi excluído com sucesso.",
        })
      },
      onError: (error) => {
        toast({
          title: "Erro ao excluir agente",
          description: "Ocorreu um erro ao excluir o agente. Tente novamente.",
          variant: "destructive",
        })
        console.error("Error deleting agent:", error)
      }
    })
  }

  const handleToggleStatus = (id: string, newStatus: 'active' | 'inactive') => {
    updateAgent({ id, status: newStatus }, {
      onSuccess: () => {
        toast({
          title: "Status atualizado",
          description: `Agente ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
        })
      },
      onError: (error) => {
        toast({
          title: "Erro ao atualizar status",
          description: "Ocorreu um erro ao alterar o status do agente. Tente novamente.",
          variant: "destructive",
        })
        console.error("Error updating agent status:", error)
      }
    })
  }

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true)
    setCreatedAgentId(null)
  }
  
  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false)
    setCreatedAgentId(null)
  }

  const handleWhatsAppConnectionSuccess = () => {
    // Fechar o dialog quando o botão "Criar Agente" for clicado
    setIsCreateDialogOpen(false)
    
    toast({
      title: "Agente criado com sucesso!",
      description: "Agente criado e configurado com sucesso.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-abba-black min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-abba-text">Carregando agentes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-abba-black min-h-screen">
      {/* Watermark */}
      <div className="fixed bottom-4 right-4 opacity-10 pointer-events-none">
        <img 
          src="/lovable-uploads/a7cf582e-5718-4f64-912a-e05c747864bf.png" 
          alt="Abba Digital" 
          className="w-16 h-16"
        />
      </div>

      <AgentsPageHeader onCreateAgent={openCreateDialog} />

      <AgentSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {filteredAgents.length === 0 ? (
        <EmptyAgentsState 
          hasAgents={agents.length > 0}
          onCreateAgent={openCreateDialog}
        />
      ) : (
        <AgentsList
          agents={filteredAgents}
          onEdit={handleEditAgent}
          onDelete={handleDeleteAgent}
          onToggleStatus={handleToggleStatus}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
        />
      )}

      <CreateAgentDialog
        isOpen={isCreateDialogOpen}
        onClose={closeCreateDialog}
        onCreateAgent={handleCreateAgent}
        onWhatsAppConnectionSuccess={handleWhatsAppConnectionSuccess}
        isCreating={isCreating}
        createdAgentId={createdAgentId}
      />
    </div>
  )
}

export default Agents
