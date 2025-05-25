import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot, MoreVertical, Activity, MessageSquare, TrendingUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tables } from "@/integrations/supabase/types"
import { DeleteAgentDialog } from "@/components/DeleteAgentDialog"

type Agent = Tables<'agents'>
type AgentMetrics = Tables<'agent_metrics'>

interface AgentCardProps {
  agent: Agent & { agent_metrics?: AgentMetrics[] }
  onEdit: (agent: Agent) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export const AgentCard = ({ agent, onEdit, onDelete, isDeleting = false }: AgentCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const metrics = agent.agent_metrics?.[0]

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "bg-abba-green text-abba-black"
      case "training":
        return "bg-yellow-500 text-black"
      case "inactive":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "training":
        return "Treinando"
      case "inactive":
        return "Inativo"
      default:
        return "Desconhecido"
    }
  }

  const getTypeText = (type: Agent["type"]) => {
    switch (type) {
      case "vendas":
        return "Vendas"
      case "atendimento":
        return "Atendimento"
      case "marketing":
        return "Marketing"
      case "rh":
        return "RH"
      case "personalizado":
        return "Personalizado"
      default:
        return "Personalizado"
    }
  }

  const getChannelText = (channel: Agent["channel"]) => {
    if (!channel) return "Não definido"
    switch (channel) {
      case "whatsapp":
        return "WhatsApp"
      case "instagram":
        return "Instagram"
      case "messenger":
        return "Messenger"
      default:
        return "Não definido"
    }
  }

  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return "Nunca"
    
    const now = new Date()
    const activity = new Date(lastActivity)
    const diffInMinutes = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Agora"
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h atrás`
    return `${Math.floor(diffInMinutes / 1440)} dias atrás`
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    onDelete(agent.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <Card className="bg-abba-black border-abba-gray hover:border-abba-green transition-all duration-200 cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-abba-green" />
            <Badge className={getStatusColor(agent.status)}>
              {getStatusText(agent.status)}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-abba-green">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-abba-black border-abba-gray">
              <DropdownMenuItem 
                className="text-abba-text hover:bg-abba-gray"
                onClick={() => onEdit(agent)}
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-abba-text hover:bg-abba-gray">
                Logs
              </DropdownMenuItem>
              <DropdownMenuItem className="text-abba-text hover:bg-abba-gray">
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-400 hover:bg-abba-gray"
                onClick={handleDeleteClick}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <CardTitle className="text-lg text-abba-text">{agent.name}</CardTitle>
              <CardDescription className="text-gray-400">
                {agent.description || "Sem descrição"}
              </CardDescription>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Tipo:</span>
              <Badge variant="outline" className="border-abba-green text-abba-green">
                {getTypeText(agent.type)}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Canal:</span>
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                {getChannelText(agent.channel)}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <MessageSquare className="h-3 w-3" />
                  Conversas
                </div>
                <span className="text-abba-green font-semibold">
                  {metrics?.conversations_count || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <TrendingUp className="h-3 w-3" />
                  Taxa de Sucesso
                </div>
                <span className="text-abba-green font-semibold">
                  {metrics?.success_rate || 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <Activity className="h-3 w-3" />
                  Última Atividade
                </div>
                <span className="text-gray-300">
                  {formatLastActivity(metrics?.last_activity)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-abba-gray">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-abba-green text-abba-green hover:bg-abba-green hover:text-abba-black"
              >
                Ver Detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteAgentDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        agent={agent}
        isDeleting={isDeleting}
      />
    </>
  )
}
