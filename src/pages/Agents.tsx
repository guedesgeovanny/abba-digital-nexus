
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MessageSquare, Bot, Users, CheckCircle, RefreshCw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { WhatsAppConnection } from "@/components/WhatsAppConnection"
import { useToast } from "@/hooks/use-toast"
import { useAgents } from "@/hooks/useAgents"
import { useWhatsAppStatusCheck } from "@/hooks/useWhatsAppStatusCheck"
import { supabase } from "@/integrations/supabase/client"

const Agents = () => {
  const { toast } = useToast()
  const { agents, isLoading, updateAgent } = useAgents()
  const { manualCheck } = useWhatsAppStatusCheck()
  const [connectingAgentId, setConnectingAgentId] = useState<string | null>(null)
  const [checkingAgentId, setCheckingAgentId] = useState<string | null>(null)

  const handleToggleStatus = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    
    const newStatus = agent.status === 'active' ? 'inactive' : 'active'
    
    updateAgent({
      id: agentId,
      status: newStatus
    })
    
    toast({
      title: "Status atualizado!",
      description: `Módulo ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
    })
  }

  const handleConnectWhatsApp = (agentId: string) => {
    console.log('🔍 DEBUGGING - handleConnectWhatsApp chamado para agentId:', agentId)
    setConnectingAgentId(agentId)
  }

  const handleWhatsAppConnect = async () => {
    if (!connectingAgentId) return { success: false }

    const agent = agents.find(a => a.id === connectingAgentId)
    if (!agent) return { success: false }

    try {
      console.log('🔗 Iniciando conexão WhatsApp para agente:', agent.name)
      
      const { data, error } = await supabase.functions.invoke('whatsapp-connect', {
        body: { 
          instanceName: agent.name, // Enviando o nome exato: "Agente-de-IA" ou "Atendimento-Humano"
          action: 'connect'
        }
      })

      if (error) {
        console.error('❌ Erro na função whatsapp-connect:', error)
        throw new Error(`Erro na conexão: ${error.message}`)
      }

      console.log('✅ Resposta da função whatsapp-connect:', data)
      return data
    } catch (error) {
      console.error('❌ Erro ao conectar WhatsApp:', error)
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao WhatsApp. Tente novamente.",
        variant: "destructive"
      })
      throw error
    }
  }

  const handleConnectionSuccess = (profileData: { profileName: string, contact: string, profilePictureUrl: string, profilePictureData?: string }) => {
    const agent = agents.find(a => a.id === connectingAgentId)
    console.log('🎉 Conexão WhatsApp bem-sucedida para agente:', agent?.name, profileData)
    console.log('🔍 DEBUGGING - handleConnectionSuccess chamado com:', {
      connectingAgentId,
      agentName: agent?.name,
      profileData: {
        profileName: profileData.profileName,
        contact: profileData.contact,
        profilePictureUrl: profileData.profilePictureUrl,
        hasProfilePictureData: !!profileData.profilePictureData
      }
    })
    
    setConnectingAgentId(null)
    toast({
      title: "WhatsApp conectado!",
      description: `Módulo ${agent?.name} conectado com sucesso.`,
    })
  }

  const handleManualStatusCheck = async (agentId: string, instanceName: string) => {
    try {
      setCheckingAgentId(agentId)
      
      const isConnected = await manualCheck(agentId, instanceName)
      
      toast({
        title: isConnected ? "Status Verificado" : "WhatsApp Desconectado",
        description: isConnected 
          ? "O agente continua conectado no WhatsApp" 
          : "O agente foi desconectado automaticamente",
        variant: isConnected ? "default" : "destructive"
      })
    } catch (error) {
      toast({
        title: "Erro na Verificação",
        description: "Não foi possível verificar o status do WhatsApp",
        variant: "destructive"
      })
    } finally {
      setCheckingAgentId(null)
    }
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'atendimento':
        return <Users className="h-6 w-6" />
      case 'vendas':
        return <Bot className="h-6 w-6" />
      case 'marketing':
        return <MessageSquare className="h-6 w-6" />
      default:
        return <MessageSquare className="h-6 w-6" />
    }
  }

  const isWhatsAppConnected = (agent: any) => {
    return agent.whatsapp_profile_name || agent.whatsapp_contact
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Módulos de Atendimento</h1>
          <p className="text-muted-foreground">
            Gerencie os módulos de atendimento disponíveis
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando módulos...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {agents.map((agent) => (
            <Card key={agent.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getModuleIcon(agent.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <CardDescription>{agent.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                      {agent.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status do Módulo</span>
                  <Switch
                    checked={agent.status === 'active'}
                    onCheckedChange={() => handleToggleStatus(agent.id)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Canal: WhatsApp</span>
                  </div>

                  {isWhatsAppConnected(agent) ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={agent.whatsapp_profile_picture_url || undefined} />
                          <AvatarFallback>
                            {(agent.whatsapp_profile_name || agent.whatsapp_contact || 'WA')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-green-800 dark:text-green-200">
                            {agent.whatsapp_profile_name || agent.whatsapp_contact || 'WhatsApp Conectado'}
                          </p>
                          {agent.whatsapp_contact && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {agent.whatsapp_contact}
                            </p>
                          )}
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const config = agent.configuration as any
                            const instanceName = config?.evolution_instance_name || agent.name
                            handleManualStatusCheck(agent.id, instanceName)
                          }}
                          disabled={checkingAgentId === agent.id}
                        >
                          {checkingAgentId === agent.id ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Verificar Status
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            // TODO: Implementar desconexão
                            toast({
                              title: "Desconectar WhatsApp",
                              description: "Funcionalidade em desenvolvimento.",
                            })
                          }}
                        >
                          Desconectar
                        </Button>
                      </div>
                    </div>
                  ) : connectingAgentId === agent.id ? (
                    <WhatsAppConnection
                      onConnect={handleWhatsAppConnect}
                      instanceName={agent.name}
                      agentId={agent.id}
                      onConnectionSuccess={handleConnectionSuccess}
                    />
                  ) : (
                    <Button 
                      onClick={() => handleConnectWhatsApp(agent.id)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={agent.status === 'inactive'}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Conectar WhatsApp
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;
