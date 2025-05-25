
import { Bot, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyAgentsStateProps {
  hasAgents: boolean
  onCreateAgent: () => void
}

export const EmptyAgentsState = ({ hasAgents, onCreateAgent }: EmptyAgentsStateProps) => {
  return (
    <div className="text-center py-12">
      <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-abba-text mb-2">
        {!hasAgents ? "Nenhum agente criado ainda" : "Nenhum agente encontrado"}
      </h3>
      <p className="text-gray-400 mb-4">
        {!hasAgents 
          ? "Crie seu primeiro agente para começar a automatizar suas conversas."
          : "Tente ajustar sua pesquisa ou criar um novo agente."
        }
      </p>
      <Button 
        onClick={onCreateAgent}
        className="bg-abba-gradient hover:opacity-90 text-abba-black font-semibold"
      >
        <Plus className="mr-2 h-4 w-4" />
        {!hasAgents ? "Criar Primeiro Agente" : "Novo Agente"}
      </Button>
    </div>
  )
}
