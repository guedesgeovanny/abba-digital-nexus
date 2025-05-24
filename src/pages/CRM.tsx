
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreVertical, Calendar, Phone, Mail, Instagram } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const mockDeals = {
  "Novo Lead": [
    {
      id: 1,
      name: "João Silva",
      company: "Tech Solutions",
      value: "R$ 15.000",
      source: "Instagram",
      agent: "Agente Vendas",
      contact: "+55 11 99999-9999",
      email: "joao@techsolutions.com",
      instagram: "@joaosilva",
      tags: ["Interessado", "Premium"],
      daysInStage: 2
    },
    {
      id: 2,
      name: "Ana Costa",
      company: "Marketing Pro",
      value: "R$ 8.500",
      source: "WhatsApp",
      agent: "Agente Marketing",
      contact: "+55 11 88888-8888",
      email: "ana@marketingpro.com",
      tags: ["Urgente"],
      daysInStage: 1
    }
  ],
  "Qualificado": [
    {
      id: 3,
      name: "Pedro Santos",
      company: "Digital Agency",
      value: "R$ 25.000",
      source: "Indicação",
      agent: "Agente Vendas",
      contact: "+55 11 77777-7777",
      email: "pedro@digitalagency.com",
      tags: ["Potencial Alto", "Decisor"],
      daysInStage: 5
    }
  ],
  "Proposta": [
    {
      id: 4,
      name: "Maria Oliveira",
      company: "E-commerce Plus",
      value: "R$ 35.000",
      source: "LinkedIn",
      agent: "Agente Suporte",
      contact: "+55 11 66666-6666",
      email: "maria@ecommerceplus.com",
      tags: ["Proposta Enviada"],
      daysInStage: 3
    }
  ],
  "Negociação": [
    {
      id: 5,
      name: "Carlos Lima",
      company: "StartupXYZ",
      value: "R$ 12.000",
      source: "Site",
      agent: "Agente Vendas",
      contact: "+55 11 55555-5555",
      email: "carlos@startupxyz.com",
      tags: ["Desconto", "Prazo"],
      daysInStage: 7
    }
  ],
  "Fechado": []
}

const stages = ["Novo Lead", "Qualificado", "Proposta", "Negociação", "Fechado"]

const getStageColor = (stage: string) => {
  switch (stage) {
    case "Novo Lead":
      return "border-blue-500"
    case "Qualificado":
      return "border-yellow-500"
    case "Proposta":
      return "border-purple-500"
    case "Negociação":
      return "border-orange-500"
    case "Fechado":
      return "border-green-500"
    default:
      return "border-gray-500"
  }
}

const CRM = () => {
  const [deals, setDeals] = useState(mockDeals)

  const getTotalValue = (stageDeals: any[]) => {
    return stageDeals.reduce((total, deal) => {
      const value = parseFloat(deal.value.replace('R$ ', '').replace('.', ''))
      return total + value
    }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "Instagram":
        return <Instagram className="w-3 h-3" />
      case "WhatsApp":
        return <Phone className="w-3 h-3" />
      default:
        return <Mail className="w-3 h-3" />
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-abba-black min-h-screen">
      {/* Watermark */}
      <div className="fixed bottom-4 right-4 opacity-10 pointer-events-none">
        <img 
          src="/lovable-uploads/fb0eee38-84d5-47c6-b95f-cb80e02e53d3.png" 
          alt="Abba Digital" 
          className="w-16 h-16"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-abba-text">CRM</h2>
          <p className="text-gray-400">
            Pipeline de vendas e controle de leads
          </p>
        </div>
        <Button className="bg-abba-green text-abba-black hover:bg-abba-green-light">
          <Plus className="w-4 h-4 mr-2" />
          Novo Deal
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {stages.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-80">
            <Card className={`bg-abba-black border-2 ${getStageColor(stage)} h-full`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-abba-text text-lg">{stage}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {deals[stage as keyof typeof deals]?.length || 0}
                  </Badge>
                </div>
                <CardDescription className="text-gray-400">
                  {getTotalValue(deals[stage as keyof typeof deals] || [])}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {deals[stage as keyof typeof deals]?.map((deal) => (
                  <Card key={deal.id} className="bg-abba-gray border-abba-gray hover:border-abba-green transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-abba-text">{deal.name}</h4>
                          <p className="text-sm text-gray-400">{deal.company}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Mover</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400">Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-abba-green">{deal.value}</span>
                          <div className="flex items-center gap-1">
                            {getSourceIcon(deal.source)}
                            <span className="text-xs text-gray-400">{deal.source}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          Agente: {deal.agent}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {deal.daysInStage} dias neste estágio
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-3 text-xs">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Phone className="w-3 h-3" />
                          {deal.contact}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Mail className="w-3 h-3" />
                          {deal.email}
                        </div>
                        {deal.instagram && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Instagram className="w-3 h-3" />
                            {deal.instagram}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1 flex-wrap">
                        {deal.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add New Deal Button */}
                <Button 
                  variant="outline" 
                  className="w-full border-dashed border-abba-gray text-gray-400 hover:text-abba-green hover:border-abba-green"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Deal
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CRM
