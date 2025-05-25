
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
}

export const AgentsList = ({ agents, onEdit, onDelete }: AgentsListProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
