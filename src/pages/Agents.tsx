
import { useState } from "react"
import { useAgents } from "@/hooks/useAgents"
import { useAgentCreation } from "@/hooks/useAgentCreation"
import { AgentsPageHeader } from "@/components/AgentsPageHeader"
import { AgentsList } from "@/components/AgentsList"
import { EmptyAgentsState } from "@/components/EmptyAgentsState"
import { CreateAgentDialog } from "@/components/CreateAgentDialog"
import { AgentForm } from "@/components/AgentForm"
import { Tables } from "@/integrations/supabase/types"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type Agent = Tables<'agents'>

const Agents = () => {
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

  const {
    createdAgentId,
    isDialogOpen,
    openDialog,
    closeDialog,
    setAgentId
  } = useAgentCreation()

  const { toast } = useToast()
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const handleCreateAgent = async (agentData: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      createAgent(agentData)
      toast({
        title: "Agente criado",
        description: "O agente foi criado com sucesso."
      })
      closeDialog()
    } catch (error) {
      console.error('Erro ao criar agente:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o agente.",
        variant: "destructive"
      })
    }
  }

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
  }

  const handleUpdateAgent = async (agentData: Partial<Agent>) => {
    if (!editingAgent) return
    
    try {
      updateAgent({ id: editingAgent.id, ...agentData })
      toast({
        title: "Agente atualizado",
        description: "O agente foi atualizado com sucesso."
      })
      setEditingAgent(null)
    } catch (error) {
      console.error('Erro ao atualizar agente:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o agente.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAgent = async (id: string) => {
    try {
      deleteAgent(id)
      toast({
        title: "Agente excluído",
        description: "O agente foi excluído com sucesso."
      })
    } catch (error) {
      console.error('Erro ao excluir agente:', error)
      toast({
        title: "Erro", 
        description: "Ocorreu um erro ao excluir o agente.",
        variant: "destructive"
      })
    }
  }

  const handleToggleStatus = async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      updateAgent({ id, status: newStatus })
      toast({
        title: "Status atualizado",
        description: `Agente ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`
      })
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o status do agente.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background min-h-screen">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background min-h-screen">
      <AgentsPageHeader onCreateAgent={openDialog} />
      
      {agents.length === 0 ? (
        <EmptyAgentsState 
          hasAgents={false} 
          onCreateAgent={openDialog} 
        />
      ) : (
        <AgentsList
          agents={agents}
          onEdit={handleEditAgent}
          onDelete={handleDeleteAgent}
          onToggleStatus={handleToggleStatus}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
        />
      )}

      {/* Create Agent Dialog */}
      <CreateAgentDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        onCreateAgent={handleCreateAgent}
        isCreating={isCreating}
        createdAgentId={createdAgentId}
      />
    </div>
  );
};

export default Agents;
