
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CRMFilters } from "@/components/CRMFilters"
import { AddStageDialog } from "@/components/AddStageDialog"
import { StageColumn } from "@/components/StageColumn"

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
  const [isAddingStage, setIsAddingStage] = useState(false)
  
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

  const handleStageRename = (oldName: string, newName: string) => {
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

  const handleAddStage = (stageName: string) => {
    setStages(prev => [...prev, stageName])
    setDeals(prev => ({ ...prev, [stageName]: [] }))
    setStageColorsMap(prev => ({ ...prev, [stageName]: stageColors[stages.length % stageColors.length] }))
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

      <CRMFilters 
        showFilters={showFilters}
        filterAgent={filterAgent}
        filterChannel={filterChannel}
        filterTag={filterTag}
        allAgents={allAgents}
        allChannels={allChannels}
        allTags={allTags}
        setFilterAgent={setFilterAgent}
        setFilterChannel={setFilterChannel}
        setFilterTag={setFilterTag}
      />

      <AddStageDialog 
        isOpen={isAddingStage}
        onClose={() => setIsAddingStage(false)}
        onAdd={handleAddStage}
      />

      {/* Kanban Board - Pipeline que ocupa quase toda a tela */}
      <div className="h-[calc(100vh-180px)] overflow-x-auto overflow-y-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 pb-6 min-w-max h-full">
            {stages.map((stage) => {
              const stageDeals = deals[stage as keyof typeof deals] || []
              const filteredStageDeals = getFilteredDeals(stageDeals)
              
              return (
                <StageColumn
                  key={stage}
                  stage={stage}
                  stageDeals={stageDeals}
                  filteredStageDeals={filteredStageDeals}
                  stageColorsMap={stageColorsMap}
                  stages={stages}
                  getTotalValue={getTotalValue}
                  onStageRename={handleStageRename}
                  onColorChange={handleColorChange}
                  onRemoveStage={removeStage}
                />
              )
            })}
          </div>
        </DndContext>
      </div>
    </div>
  )
}

export default CRM
