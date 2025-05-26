
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Bot, MoreVertical, Smartphone, User } from "lucide-react"
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

interface AgentConfiguration {
  connection_status?: string
  evolution_api_key?: string | null
  evolution_instance_name?: string | null
  profile_picture_data?: string | null
}

interface AgentCardProps {
  agent: Agent & { agent_metrics?: AgentMetrics[] }
  onEdit: (agent: Agent) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void
  isDeleting?: boolean
  isUpdating?: boolean
}

export const AgentCard = ({ 
  agent, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  isDeleting = false,
  isUpdating = false 
}: AgentCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const configuration = agent.configuration as AgentConfiguration

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "bg-abba-green text-abba-black"
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
      case "inactive":
        return "Inativo"
      default:
        return "Inativo"
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

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    onDelete(agent.id)
    setIsDeleteDialogOpen(false)
  }

  const handleToggleStatus = () => {
    const newStatus = agent.status === 'active' ? 'inactive' : 'active'
    onToggleStatus(agent.id, newStatus)
  }

  const getInstanceName = () => {
    return configuration?.evolution_instance_name || "Instância não configurada"
  }

  const getProfilePicture = () => {
    // Priorizar a URL do WhatsApp salva no banco
    if (agent.whatsapp_profile_picture_url) {
      return agent.whatsapp_profile_picture_url
    }
    // Segundo, tentar usar os dados base64 do WhatsApp
    if (agent.whatsapp_profile_picture_data) {
      return `data:image/jpeg;base64,${agent.whatsapp_profile_picture_data}`
    }
    // Fallback para configuração antiga
    return configuration?.profile_picture_data || null
  }

  const getWhatsAppContact = () => {
    return agent.whatsapp_contact || null
  }

  const isWhatsAppConnected = () => {
    return !!(agent.whatsapp_contact)
  }

  const handleConnectWhatsApp = () => {
    // Aqui você pode implementar a lógica para abrir o dialog de conexão
    // Por enquanto, vamos apenas chamar o onEdit para abrir o dialog de edição
    onEdit(agent)
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
          
          <div className="flex items-center space-x-2">
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <CardTitle className="text-lg text-abba-text">{agent.name}</CardTitle>
              <CardDescription className="text-gray-400">
                {getInstanceName()}
              </CardDescription>
            </div>

            {/* Seção do WhatsApp melhorada */}
            <div className={`${isWhatsAppConnected() ? 'bg-green-900/20 border-green-500/30' : 'bg-gray-900/20 border-gray-500/30'} border rounded-lg p-4 space-y-3`}>
              <div className="flex items-center justify-between">
                <span className={`${isWhatsAppConnected() ? 'text-green-400' : 'text-gray-400'} font-medium text-sm`}>
                  WhatsApp {isWhatsAppConnected() ? 'Conectado' : 'Desconectado'}
                </span>
                <Badge variant="outline" className={`${isWhatsAppConnected() ? 'border-green-400 text-green-400' : 'border-gray-400 text-gray-400'} text-xs`}>
                  {isWhatsAppConnected() ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
              
              {isWhatsAppConnected() ? (
                <div className="space-y-3">
                  {/* Foto do perfil do WhatsApp */}
                  <div className="flex justify-center">
                    <Avatar className="h-12 w-12 border-2 border-green-400">
                      <AvatarImage 
                        src={getProfilePicture() || undefined} 
                        alt="WhatsApp Profile" 
                      />
                      <AvatarFallback className="bg-green-100 text-green-800">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Contato em destaque */}
                  {getWhatsAppContact() && (
                    <div className="text-center">
                      <div className="text-green-300 font-semibold text-base">
                        {getWhatsAppContact()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Nenhum WhatsApp conectado</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-6 text-xs border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                    onClick={handleConnectWhatsApp}
                  >
                    <Smartphone className="h-3 w-3 mr-1" />
                    Conectar
                  </Button>
                </div>
              )}
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

            <div className="pt-3 border-t border-abba-gray">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Status do Agente</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">
                    {agent.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                  <Switch
                    checked={agent.status === 'active'}
                    onCheckedChange={handleToggleStatus}
                    disabled={isUpdating}
                    className="data-[state=checked]:bg-abba-green border-2 border-white"
                  />
                </div>
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
