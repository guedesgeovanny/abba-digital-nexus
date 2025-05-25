
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AgentsPageHeaderProps {
  onCreateAgent: () => void
}

export const AgentsPageHeader = ({ onCreateAgent }: AgentsPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-abba-text">Agentes</h2>
        <p className="text-gray-400">
          Gerencie seus agentes digitais inteligentes
        </p>
      </div>
      <Button 
        onClick={onCreateAgent}
        className="bg-abba-gradient hover:opacity-90 text-abba-black font-semibold"
      >
        <Plus className="mr-2 h-4 w-4" />
        Novo Agente
      </Button>
    </div>
  )
}
