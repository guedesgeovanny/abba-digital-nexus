
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Bot } from "lucide-react"
import { useAgents } from "@/hooks/useAgents"
import { AgentCard } from "@/components/AgentCard"
import { CreateAgentDialog } from "@/components/CreateAgentDialog"
import { Tables } from "@/integrations/supabase/types"
import { useToast } from "@/hooks/use-toast"

type Agent = Tables<'agents'>

const Agents = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()
  
  const { 
    agents, 
    isLoading, 
    createAgent, 
    deleteAgent, 
    isCreating 
  } = useAgents()

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agent.description && agent.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCreateAgent = (agentData: Parameters<typeof createAgent>[0]) => {
    createAgent(agentData, {
      onSuccess: () => {
        toast({
          title: "Agente criado com sucesso!",
          description: `O agente ${agentData.name} foi criado e está pronto para uso.`,
        })
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
    // TODO: Implementar edição de agente
    console.log("Edit agent:", agent)
  }

  const handleDeleteAgent = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este agente?")) {
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-abba-text">Agentes</h2>
          <p className="text-gray-400">
            Gerencie seus agentes digitais inteligentes
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-abba-gradient hover:opacity-90 text-abba-black font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Agente
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar agentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
          />
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onEdit={handleEditAgent}
            onDelete={handleDeleteAgent}
          />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-abba-text mb-2">
            {agents.length === 0 ? "Nenhum agente criado ainda" : "Nenhum agente encontrado"}
          </h3>
          <p className="text-gray-400 mb-4">
            {agents.length === 0 
              ? "Crie seu primeiro agente para começar a automatizar suas conversas."
              : "Tente ajustar sua pesquisa ou criar um novo agente."
            }
          </p>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-abba-gradient hover:opacity-90 text-abba-black font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            {agents.length === 0 ? "Criar Primeiro Agente" : "Novo Agente"}
          </Button>
        </div>
      )}

      <CreateAgentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateAgent={handleCreateAgent}
        isCreating={isCreating}
      />
    </div>
  )
}

export default Agents
