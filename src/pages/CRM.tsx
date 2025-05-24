import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, MoreVertical, Calendar, Phone, Mail, Instagram, Edit2, Palette, X, Filter } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ScrollArea } from "@/components/ui/scroll-area"

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

const stageColors = [
  "#3B82F6", // blue
  "#EAB308", // yellow
  "#8B5CF6", // purple
  "#F97316", // orange
  "#22C55E", // green
  "#EF4444", // red
  "#06B6D4", // cyan
  "#EC4899", // pink
]

interface LeadCardProps {
  deal: any
  stageColor: string
}

const LeadCard = ({ deal, stageColor }: LeadCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`
        bg-abba-gray border-abba-gray transition-all duration-200 cursor-grab active:cursor-grabbing
        hover:border-abba-green hover:shadow-lg hover:shadow-abba-green/20 hover:scale-[1.02]
        ${isDragging ? 'shadow-2xl shadow-abba-green/40 scale-105 rotate-2 border-abba-green' : ''}
      `}
    >
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
  )
}

const CRM = () => {
  const [deals, setDeals] = useState(mockDeals)
  const [stages, setStages] = useState(["Novo Lead", "Qualificado", "Proposta", "Negociação", "Fechado"])
  const [stageColorsMap, setStageColorsMap] = useState<Record<string, string>>({
    "Novo Lead": "#3B82F6",
    "Qualificado": "#EAB308", 
    "Proposta": "#8B5CF6",
    "Negociação": "#F97316",
    "Fechado": "#22C55E"
  })
  const [editingStage, setEditingStage] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [isAddingStage, setIsAddingStage] = useState(false)
  const [newStageName, setNewStageName] = useState("")
  
  // Filter states
  const [filterAgent, setFilterAgent] = useState("")
  const [filterChannel, setFilterChannel] = useState("")
  const [filterTag, setFilterTag] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Get unique values for filters
  const allAgents = Array.from(new Set(Object.values(deals).flat().map(deal => deal.agent)))
  const allChannels = Array.from(new Set(Object.values(deals).flat().map(deal => deal.source)))
  const allTags = Array.from(new Set(Object.values(deals).flat().flatMap(deal => deal.tags)))

  // Filter deals
  const getFilteredDeals = (stageDeals: any[]) => {
    return stageDeals.filter(deal => {
      return (
        (filterAgent === "" || deal.agent === filterAgent) &&
        (filterChannel === "" || deal.source === filterChannel) &&
        (filterTag === "" || deal.tags.includes(filterTag))
      )
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find which stage the deal is moving from and to
    let fromStage = ""
    let toStage = ""

    // Find the source stage
    for (const [stage, stageDeals] of Object.entries(deals)) {
      if (stageDeals.find(deal => deal.id === activeId)) {
        fromStage = stage
        break
      }
    }

    // Determine target stage
    if (typeof overId === 'string' && stages.includes(overId)) {
      toStage = overId
    } else {
      // Find which stage contains the target deal
      for (const [stage, stageDeals] of Object.entries(deals)) {
        if (stageDeals.find(deal => deal.id === overId)) {
          toStage = stage
          break
        }
      }
    }

    if (fromStage && toStage && fromStage !== toStage) {
      const dealToMove = deals[fromStage as keyof typeof deals].find(deal => deal.id === activeId)
      
      if (dealToMove) {
        setDeals(prev => ({
          ...prev,
          [fromStage]: prev[fromStage as keyof typeof prev].filter(deal => deal.id !== activeId),
          [toStage]: [...(prev[toStage as keyof typeof prev] || []), dealToMove]
        }))
      }
    }
  }

  const getTotalValue = (stageDeals: any[]) => {
    const filtered = getFilteredDeals(stageDeals)
    return filtered.reduce((total, deal) => {
      const value = parseFloat(deal.value.replace('R$ ', '').replace('.', ''))
      return total + value
    }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleStageEdit = (stage: string) => {
    setEditingStage(stage)
    setEditingValue(stage)
  }

  const handleStageRename = () => {
    if (editingStage && editingValue.trim()) {
      const oldName = editingStage
      const newName = editingValue.trim()
      
      setStages(prev => prev.map(s => s === oldName ? newName : s))
      setDeals(prev => {
        const newDeals = { ...prev }
        if (newDeals[oldName as keyof typeof newDeals]) {
          newDeals[newName as keyof typeof newDeals] = newDeals[oldName as keyof typeof newDeals]
          delete newDeals[oldName as keyof typeof newDeals]
        }
        return newDeals
      })
      setStageColorsMap(prev => {
        const newColors = { ...prev }
        newColors[newName] = prev[oldName]
        delete newColors[oldName]
        return newColors
      })
    }
    setEditingStage(null)
    setEditingValue("")
  }

  const handleAddStage = () => {
    if (newStageName.trim()) {
      const stageName = newStageName.trim()
      setStages(prev => [...prev, stageName])
      setDeals(prev => ({ ...prev, [stageName]: [] }))
      setStageColorsMap(prev => ({ ...prev, [stageName]: stageColors[stages.length % stageColors.length] }))
      setNewStageName("")
      setIsAddingStage(false)
    }
  }

  const handleColorChange = (stage: string, color: string) => {
    setStageColorsMap(prev => ({ ...prev, [stage]: color }))
  }

  const removeStage = (stageToRemove: string) => {
    setStages(prev => prev.filter(s => s !== stageToRemove))
    setDeals(prev => {
      const newDeals = { ...prev }
      delete newDeals[stageToRemove as keyof typeof newDeals]
      return newDeals
    })
    setStageColorsMap(prev => {
      const newColors = { ...prev }
      delete newColors[stageToRemove]
      return newColors
    })
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
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            variant="outline" 
            className="border-abba-gray text-abba-text"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button 
            onClick={() => setIsAddingStage(true)}
            variant="outline" 
            className="border-abba-green text-abba-green"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Etapa
          </Button>
          <Button className="bg-abba-green text-abba-black hover:bg-abba-green-light">
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-abba-black border-abba-gray">
          <CardHeader>
            <CardTitle className="text-abba-text">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Select value={filterAgent} onValueChange={setFilterAgent}>
                <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
                  <SelectValue placeholder="Agente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os agentes</SelectItem>
                  {allAgents.map((agent) => (
                    <SelectItem key={agent} value={agent}>
                      {agent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterChannel} onValueChange={setFilterChannel}>
                <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os canais</SelectItem>
                  {allChannels.map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {channel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => {
                  setFilterAgent("")
                  setFilterChannel("")
                  setFilterTag("")
                }}
                variant="outline"
                className="border-abba-gray text-abba-text"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para adicionar nova etapa */}
      <Dialog open={isAddingStage} onOpenChange={setIsAddingStage}>
        <DialogContent className="bg-abba-black border-abba-gray">
          <DialogHeader>
            <DialogTitle className="text-abba-text">Adicionar Nova Etapa</DialogTitle>
            <DialogDescription className="text-gray-400">
              Digite o nome da nova etapa do pipeline
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            placeholder="Nome da etapa..."
            className="bg-abba-gray border-abba-gray text-abba-text"
            onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingStage(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddStage} className="bg-abba-green text-abba-black hover:bg-abba-green-light">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kanban Board - Pipeline que ocupa quase toda a tela */}
      <div className="h-[calc(100vh-180px)] overflow-x-auto overflow-y-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 pb-6 min-w-max h-full">
            {stages.map((stage) => {
              const stageDeals = deals[stage as keyof typeof deals] || []
              const filteredStageDeals = getFilteredDeals(stageDeals)
              
              return (
                <div key={stage} className="flex-shrink-0 w-80 h-full">
                  <Card className="bg-abba-black border-2 h-full flex flex-col" style={{ borderColor: stageColorsMap[stage] }}>
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        {editingStage === stage ? (
                          <Input
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={handleStageRename}
                            onKeyDown={(e) => e.key === 'Enter' && handleStageRename()}
                            className="bg-abba-gray border-abba-gray text-abba-text text-lg font-medium"
                            autoFocus
                          />
                        ) : (
                          <CardTitle className="text-abba-text text-lg">{stage}</CardTitle>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {filteredStageDeals.length}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStageEdit(stage)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Editar Nome
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {}}
                                className="focus:bg-transparent"
                              >
                                <Palette className="w-4 h-4 mr-2" />
                                <div className="flex gap-1">
                                  {stageColors.map((color) => (
                                    <button
                                      key={color}
                                      className="w-4 h-4 rounded-full border border-gray-300"
                                      style={{ backgroundColor: color }}
                                      onClick={() => handleColorChange(stage, color)}
                                    />
                                  ))}
                                </div>
                              </DropdownMenuItem>
                              {stages.length > 1 && (
                                <DropdownMenuItem 
                                  onClick={() => removeStage(stage)}
                                  className="text-red-400"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Remover
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <CardDescription className="text-gray-400">
                        {getTotalValue(stageDeals)}
                      </CardDescription>
                    </CardHeader>
                    
                    {/* Conteúdo com scroll */}
                    <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                      <div className="flex-1 overflow-y-auto px-6 space-y-3">
                        <SortableContext 
                          items={filteredStageDeals.map(deal => deal.id)} 
                          strategy={verticalListSortingStrategy}
                        >
                          {filteredStageDeals.map((deal) => (
                            <LeadCard 
                              key={deal.id} 
                              deal={deal} 
                              stageColor={stageColorsMap[stage]} 
                            />
                          ))}
                        </SortableContext>
                      </div>
                      
                      {/* Botão fixo no final */}
                      <div className="flex-shrink-0 p-6 pt-3">
                        <Button 
                          variant="outline" 
                          className="w-full border-dashed border-abba-gray text-gray-400"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Lead
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </DndContext>
      </div>
    </div>
  )
}

export default CRM
