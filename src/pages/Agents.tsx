
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MessageSquare, Bot, Users } from "lucide-react"
import { WhatsAppConnection } from "@/components/WhatsAppConnection"
import { useToast } from "@/hooks/use-toast"

interface Module {
  id: string
  name: string
  type: string
  description: string
  status: 'active' | 'inactive'
  channel: string
}

const FIXED_MODULES: Module[] = [
  {
    id: 'atendimento-humano',
    name: 'Atendimento-Humano',
    type: 'human',
    description: 'Módulo para atendimento humanizado com agentes reais',
    status: 'inactive',
    channel: 'whatsapp'
  },
  {
    id: 'agente-de-ia',
    name: 'Agente-de-IA',
    type: 'ai',
    description: 'Módulo de atendimento automatizado com inteligência artificial',
    status: 'inactive',
    channel: 'whatsapp'
  }
]

const Agents = () => {
  const { toast } = useToast()
  const [modules, setModules] = useState<Module[]>(FIXED_MODULES)
  const [connectingModule, setConnectingModule] = useState<string | null>(null)

  const handleToggleStatus = (moduleId: string) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, status: module.status === 'active' ? 'inactive' : 'active' }
        : module
    ))
    
    const module = modules.find(m => m.id === moduleId)
    const newStatus = module?.status === 'active' ? 'inactive' : 'active'
    
    toast({
      title: "Status atualizado!",
      description: `Módulo ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
    })
  }

  const handleConnectWhatsApp = (moduleId: string) => {
    setConnectingModule(moduleId)
  }

  const handleWhatsAppConnect = async () => {
    // Simular conexão WhatsApp
    return { success: true }
  }

  const handleConnectionSuccess = (moduleId: string) => {
    setConnectingModule(null)
    toast({
      title: "WhatsApp conectado!",
      description: "Módulo conectado ao WhatsApp com sucesso.",
    })
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'human':
        return <Users className="h-6 w-6" />
      case 'ai':
        return <Bot className="h-6 w-6" />
      default:
        return <MessageSquare className="h-6 w-6" />
    }
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

      <div className="grid gap-6 md:grid-cols-2">
        {modules.map((module) => (
          <Card key={module.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getModuleIcon(module.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                    {module.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status do Módulo</span>
                <Switch
                  checked={module.status === 'active'}
                  onCheckedChange={() => handleToggleStatus(module.id)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Canal: WhatsApp</span>
                </div>

                {connectingModule === module.id ? (
                  <WhatsAppConnection
                    onConnect={handleWhatsAppConnect}
                    instanceName={module.name}
                    onConnectionSuccess={(profileData) => handleConnectionSuccess(module.id)}
                  />
                ) : (
                  <Button 
                    onClick={() => handleConnectWhatsApp(module.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={module.status === 'inactive'}
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
    </div>
  );
};

export default Agents;
