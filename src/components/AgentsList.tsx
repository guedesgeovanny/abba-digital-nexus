
import { AgentCard } from "@/components/AgentCard"
import { Tables } from "@/integrations/supabase/types"

type Agent = Tables<'agents'>
type AgentWithMetrics = Agent & {
  agent_metrics?: Tables<'agent_metrics'>[]
}

interface AgentsListProps {
  agents: AgentWithMetrics[]
  onEdit: (agent: Agent) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void
  isDeleting?: boolean
  isUpdating?: boolean
}

export const AgentsList = ({ 
  agents, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  isDeleting = false,
  isUpdating = false 
}: AgentsListProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  )
}
