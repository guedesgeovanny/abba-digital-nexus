
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
  rectIntersection
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CRMFilters } from "@/components/CRMFilters"
import { AddStageDialog } from "@/components/AddStageDialog"
import { StageColumn } from "@/components/StageColumn"
import { LeadCard } from "@/components/LeadCard"
import { useNavigate } from "react-router-dom"

import { useCRMConversations, CRMConversation } from "@/hooks/useCRMConversations"
import { ContactForm } from "@/components/ContactForm"
import { LeadDetailsDialog } from "@/components/LeadDetailsDialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

const CRM = () => {
  const {
    crmData,
    stages,
    stageColorsMap,
    isLoading,
    updateConversationStatus,
    addCustomStage,
    // Filter states and functions
    filterChannel,
    filterValueRange,
    filterPeriod,
    filterStatus,
    setFilterChannel,
    setFilterValueRange,
    setFilterPeriod,
    setFilterStatus,
    clearFilters,
    allChannels,
    hasValueData,
    totalLeads,
    filteredLeadsCount
  } = useCRMConversations()

  const [isAddingStage, setIsAddingStage] = useState(false)
  const [showNewLead, setShowNewLead] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<CRMConversation | null>(null)
  const [showLeadDetails, setShowLeadDetails] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const navigate = useNavigate()
  
  // Simplify filters for now - remove complex filtering
  const [showFilters, setShowFilters] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )


  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find which stage the conversation is moving from and to
    let fromStage = ""
    let toStage = ""

    // Find the source stage
    for (const [stage, conversations] of Object.entries(crmData)) {
      if (conversations.find(conv => conv.id === activeId)) {
        fromStage = stage
        break
      }
    }

    // Determine target stage
    if (stages.includes(overId)) {
      toStage = overId
    } else {
      // Find which stage contains the target conversation
      for (const [stage, conversations] of Object.entries(crmData)) {
        if (conversations.find(conv => conv.id === overId)) {
          toStage = stage
          break
        }
      }
    }

    if (fromStage && toStage && fromStage !== toStage) {
      try {
        await updateConversationStatus(activeId, toStage)
      } catch (error) {
        console.error('Error updating conversation status:', error)
      }
    }
  }

  const handleStageRename = (oldName: string, newName: string) => {
    // Para implementação futura - por enquanto mantemos os estágios fixos
    console.log('Stage rename not implemented yet:', { oldName, newName })
  }

  const handleAddStage = async (stageName: string) => {
    try {
      await addCustomStage(stageName)
      setIsAddingStage(false)
    } catch (error) {
      console.error('Error adding stage:', error)
    }
  }

  const handleColorChange = (stage: string, color: string) => {
    // Para implementação futura - cores são fixas por enquanto
    console.log('Color change not implemented yet:', { stage, color })
  }

  const removeStage = (stageToRemove: string) => {
    // Para implementação futura - por enquanto mantemos os estágios fixos
    console.log('Remove stage not implemented yet:', stageToRemove)
  }

  const handleCardClick = (conversation: CRMConversation) => {
    setSelectedConversation(conversation)
    setShowLeadDetails(true)
  }

  const handleCloseLeadDetails = () => {
    setShowLeadDetails(false)
    setSelectedConversation(null)
  }

  // Get the currently dragging conversation for overlay
  const activeConversation = activeDragId ? 
    Object.values(crmData).flat().find(conv => conv.id === activeDragId) : null

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
          {['Novo Lead', 'Em Andamento', 'Qualificado', 'Convertido', 'Perdido'].map((stage) => (
            <div key={stage} className="flex-1 space-y-4">
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

      {/* Filters */}
      <CRMFilters
        showFilters={showFilters}
        filterChannel={filterChannel}
        filterValueRange={filterValueRange}
        filterPeriod={filterPeriod}
        filterStatus={filterStatus}
        allChannels={allChannels}
        hasValueData={hasValueData}
        setFilterChannel={setFilterChannel}
        setFilterValueRange={setFilterValueRange}
        setFilterPeriod={setFilterPeriod}
        setFilterStatus={setFilterStatus}
        clearFilters={clearFilters}
        filteredLeadsCount={filteredLeadsCount}
        totalLeads={totalLeads}
      />

      <AddStageDialog 
        isOpen={isAddingStage}
        onClose={() => setIsAddingStage(false)}
        onAdd={handleAddStage}
      />

      <LeadDetailsDialog
        isOpen={showLeadDetails}
        onClose={handleCloseLeadDetails}
        conversation={selectedConversation}
      />

      {/* Kanban Board - Pipeline que ocupa quase toda a tela */}
      <div className="h-[calc(100vh-180px)] overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 pb-6 min-w-max h-full">
            {stages.map((stage) => {
              const conversations = crmData[stage] || []
              
              return (
                <StageColumn
                  key={stage}
                  stage={stage}
                  conversations={conversations}
                  stageColorsMap={stageColorsMap}
                  onCardClick={handleCardClick}
                />
              )
            })}
          </div>
          
          <DragOverlay>
            {activeConversation ? (
              <div className="transform rotate-6 scale-105">
                <LeadCard 
                  conversation={activeConversation} 
                  isDragOverlay={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

export default CRM
