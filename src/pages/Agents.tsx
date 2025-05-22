
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Bot, Plus, Search, MoreVertical, Activity, MessageSquare, TrendingUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Agent {
  id: string
  name: string
  type: string
  status: "active" | "inactive" | "training"
  conversations: number
  successRate: number
  lastActivity: string
  description: string
}

const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Agente Vendas Pro",
    type: "Vendas",
    status: "active",
    conversations: 156,
    successRate: 94.5,
    lastActivity: "5 min atrás",
    description: "Especializado em conversão de leads e fechamento de vendas"
  },
  {
    id: "2",
    name: "Suporte 24/7",
    type: "Atendimento",
    status: "active",
    conversations: 89,
    successRate: 91.2,
    lastActivity: "2 min atrás",
    description: "Atendimento ao cliente e resolução de problemas"
  },
  {
    id: "3",
    name: "Marketing Bot",
    type: "Marketing",
    status: "training",
    conversations: 23,
    successRate: 78.3,
    lastActivity: "1 hora atrás",
    description: "Qualificação de leads e nurturing"
  },
  {
    id: "4",
    name: "Recrutamento AI",
    type: "RH",
    status: "inactive",
    conversations: 45,
    successRate: 85.7,
    lastActivity: "2 dias atrás",
    description: "Triagem de candidatos e agendamento de entrevistas"
  },
]

const Agents = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredAgents, setFilteredAgents] = useState(mockAgents)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = mockAgents.filter(agent =>
      agent.name.toLowerCase().includes(value.toLowerCase()) ||
      agent.type.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredAgents(filtered)
  }

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
        <Button className="bg-abba-gradient hover:opacity-90 text-abba-black font-semibold">
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
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
          />
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="bg-abba-black border-abba-gray hover:border-abba-green transition-all duration-200 cursor-pointer">
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
                  <DropdownMenuItem className="text-abba-text hover:bg-abba-gray">
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-abba-text hover:bg-abba-gray">
                    Logs
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-abba-text hover:bg-abba-gray">
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400 hover:bg-abba-gray">
                    Desativar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <CardTitle className="text-lg text-abba-text">{agent.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {agent.description}
                  </CardDescription>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tipo:</span>
                  <Badge variant="outline" className="border-abba-green text-abba-green">
                    {agent.type}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <MessageSquare className="h-3 w-3" />
                      Conversas
                    </div>
                    <span className="text-abba-green font-semibold">{agent.conversations}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <TrendingUp className="h-3 w-3" />
                      Taxa de Sucesso
                    </div>
                    <span className="text-abba-green font-semibold">{agent.successRate}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Activity className="h-3 w-3" />
                      Última Atividade
                    </div>
                    <span className="text-gray-300">{agent.lastActivity}</span>
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
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-abba-text mb-2">Nenhum agente encontrado</h3>
          <p className="text-gray-400 mb-4">Tente ajustar sua pesquisa ou criar um novo agente.</p>
          <Button className="bg-abba-gradient hover:opacity-90 text-abba-black font-semibold">
            <Plus className="mr-2 h-4 w-4" />
            Criar Primeiro Agente
          </Button>
        </div>
      )}
    </div>
  )
}

export default Agents
