import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CRMFilters } from "@/components/CRMFilters"
import { AddStageDialog } from "@/components/AddStageDialog"
import { StageColumn } from "@/components/StageColumn"
import { useCRMData } from "@/hooks/useCRMData"
import { ContactForm } from "@/components/ContactForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

const CRM = () => {
  const {
    crmData,
    stages,
    stageColorsMap,
    isLoading,
    updateDealStatus,
    getFilteredDeals,
    getTotalValue,
    getUniqueAgents,
    getUniqueChannels,
    getUniqueTags
  } = useCRMData()

  const [isAddingStage, setIsAddingStage] = useState(false)
  const [showNewLead, setShowNewLead] = useState(false)
  
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

  const filters = {
    agent: filterAgent || undefined,
    channel: filterChannel || undefined,
    tag: filterTag || undefined
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find which stage the deal is moving from and to
    let fromStage = ""
    let toStage = ""

    // Find the source stage
    for (const [stage, stageDeals] of Object.entries(crmData)) {
      if (stageDeals.find(deal => deal.id === activeId)) {
        fromStage = stage
        break
      }
    }

    // Determine target stage
    if (stages.includes(overId)) {
      toStage = overId
    } else {
      // Find which stage contains the target deal
      for (const [stage, stageDeals] of Object.entries(crmData)) {
        if (stageDeals.find(deal => deal.id === overId)) {
          toStage = stage
          break
        }
      }
    }

    if (fromStage && toStage && fromStage !== toStage) {
      try {
        await updateDealStatus(activeId, toStage)
      } catch (error) {
        console.error('Error updating deal status:', error)
      }
    }
  }

  const handleStageRename = (oldName: string, newName: string) => {
    // Para implementação futura - por enquanto mantemos os estágios fixos
    console.log('Stage rename not implemented yet:', { oldName, newName })
  }

  const handleAddStage = (stageName: string) => {
    // Para implementação futura - por enquanto mantemos os estágios fixos
    console.log('Add stage not implemented yet:', stageName)
    setIsAddingStage(false)
  }

  const handleColorChange = (stage: string, color: string) => {
    // Para implementação futura - cores são fixas por enquanto
    console.log('Color change not implemented yet:', { stage, color })
  }

  const removeStage = (stageToRemove: string) => {
    // Para implementação futura - por enquanto mantemos os estágios fixos
    console.log('Remove stage not implemented yet:', stageToRemove)
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-abba-black min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-abba-text">CRM</h2>
            <p className="text-gray-400">Pipeline de vendas e controle de leads</p>
          </div>
        </div>
        <div className="flex gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 space-y-4">
              <Skeleton className="h-12 w-full bg-abba-gray" />
              <Skeleton className="h-32 w-full bg-abba-gray" />
              <Skeleton className="h-32 w-full bg-abba-gray" />
            </div>
          ))}
        </div>
      </div>
    )
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
          <Dialog open={showNewLead} onOpenChange={setShowNewLead}>
            <DialogTrigger asChild>
              <Button className="bg-abba-green text-abba-black hover:bg-abba-green-light">
                <Plus className="w-4 h-4 mr-2" />
                Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-abba-gray border-abba-gray">
              <DialogHeader>
                <DialogTitle className="text-abba-text">Criar Novo Lead</DialogTitle>
              </DialogHeader>
              <ContactForm onClose={() => setShowNewLead(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <CRMFilters 
        showFilters={showFilters}
        filterAgent={filterAgent}
        filterChannel={filterChannel}
        filterTag={filterTag}
        allAgents={getUniqueAgents()}
        allChannels={getUniqueChannels()}
        allTags={getUniqueTags()}
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
              const stageDeals = crmData[stage] || []
              const filteredStageDeals = getFilteredDeals(stageDeals, filters)
              
              return (
                <StageColumn
                  key={stage}
                  stage={stage}
                  stageDeals={stageDeals}
                  filteredStageDeals={filteredStageDeals}
                  stageColorsMap={stageColorsMap}
                  stages={stages}
                  getTotalValue={(deals) => getTotalValue(deals, filters)}
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