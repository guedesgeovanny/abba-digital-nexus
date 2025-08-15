
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
import { 
  SortableContext, 
  horizontalListSortingStrategy,
  arrayMove 
} from '@dnd-kit/sortable'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CRMFilters } from "@/components/CRMFilters"
import { AddStageDialog } from "@/components/AddStageDialog"
import { StageColumn } from "@/components/StageColumn"
import { LeadCard } from "@/components/LeadCard"
import { SortableStageHeader } from "@/components/SortableStageHeader"
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
    updateStageOrder,
    updateBasicStageOrder,
    deleteCustomStage,
    customStages,
    basicStages,
    // Filter states and functions
    filterChannel,
    filterValueRange,
    filterPeriod,
    filterStatus,
    filterUser,
    setFilterChannel,
    setFilterValueRange,
    setFilterPeriod,
    setFilterStatus,
    setFilterUser,
    clearFilters,
    allChannels,
    hasValueData,
    allUsers,
    totalLeads,
    filteredLeadsCount,
    // User role information
    isAdmin,
    currentUserId
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

    // Check if we're reordering stage headers
    if (activeId.startsWith('stage-header-') && overId.startsWith('stage-header-')) {
      // Only allow admins to reorder stages
      if (!isAdmin) {
        console.log('Only admins can reorder stages')
        return
      }
      
      const activeStage = activeId.replace('stage-header-', '')
      const overStage = overId.replace('stage-header-', '')
      
      // Find the indices in the current stages array
      const oldIndex = stages.findIndex(s => s === activeStage)
      const newIndex = stages.findIndex(s => s === overStage)
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        // Reorder stages array
        const newStagesOrder = arrayMove(stages, oldIndex, newIndex)
        
        // For custom stages, update their positions in database
        const activeCustomStage = customStages.find(s => s.name === activeStage)
        if (activeCustomStage) {
          // This is a custom stage being moved
          const newCustomStages = newStagesOrder
            .map((stageName, index) => customStages.find(s => s.name === stageName))
            .filter(Boolean)
            .map((stage, index) => ({ ...stage!, position: index }))
          
          try {
            await updateStageOrder(newCustomStages)
          } catch (error) {
            console.error('Error reordering custom stages:', error)
          }
        } else {
          // This might be a basic stage - for now we just log it
          // Could implement basic stage ordering later
          console.log('Basic stage reordering:', newStagesOrder)
        }
      }
      return
    }

    // Handle conversation dragging (existing logic)
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

  const handleDeleteStage = async (stageName: string) => {
    // Find the custom stage to delete
    const stageToDelete = customStages.find(stage => stage.name === stageName)
    if (!stageToDelete) {
      console.error('Stage not found:', stageName)
      return
    }

    try {
      await deleteCustomStage(stageToDelete.id, stageName)
    } catch (error) {
      console.error('Error deleting stage:', error)
    }
  }

  const handleCardClick = (conversation: CRMConversation) => {
    setSelectedConversation(conversation)
    setShowLeadDetails(true)
  }

  const handleCloseLeadDetails = () => {
    setShowLeadDetails(false)
    setSelectedConversation(null)
  }

  // Get the currently dragging conversation or stage for overlay
  const activeConversation = activeDragId && !activeDragId.startsWith('stage-header-') ? 
    Object.values(crmData).flat().find(conv => conv.id === activeDragId) : null
  
  const activeStageHeader = activeDragId && activeDragId.startsWith('stage-header-') ?
    activeDragId.replace('stage-header-', '') : null

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">CRM</h2>
            <p className="text-muted-foreground">Pipeline de vendas e controle de leads</p>
          </div>
        </div>
        <div className="flex gap-6">
          {['Novo Lead', 'Em Andamento', 'Qualificado', 'Convertido', 'Perdido'].map((stage) => (
            <div key={stage} className="flex-1 space-y-4">
              <Skeleton className="h-12 w-full bg-muted" />
              <Skeleton className="h-32 w-full bg-muted" />
              <Skeleton className="h-32 w-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background min-h-screen">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">CRM</h2>
          <p className="text-muted-foreground">
            Pipeline de vendas e controle de leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            variant="outline" 
            className="border-border text-foreground"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button 
            onClick={() => setIsAddingStage(true)}
            variant="outline" 
            className="border-abba-green text-abba-green hover:bg-abba-green hover:text-white"
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
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Criar Novo Lead</DialogTitle>
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
        filterUser={filterUser}
        allChannels={allChannels}
        hasValueData={hasValueData}
        allUsers={allUsers}
        isAdmin={isAdmin}
        setFilterChannel={setFilterChannel}
        setFilterValueRange={setFilterValueRange}
        setFilterPeriod={setFilterPeriod}
        setFilterStatus={setFilterStatus}
        setFilterUser={setFilterUser}
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
          <SortableContext 
            items={stages.map(stage => `stage-header-${stage}`)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-6 pb-6 min-w-max h-full">
              {stages.map((stage) => {
                const conversations = crmData[stage] || []
                const isCustomStage = customStages.some(s => s.name === stage)
                
                return (
                  <StageColumn
                    key={stage}
                    stage={stage}
                    conversations={conversations}
                    stageColorsMap={stageColorsMap}
                    onCardClick={handleCardClick}
                    isAdmin={isAdmin}
                    currentUserId={currentUserId}
                    isCustom={isCustomStage}
                    onDeleteStage={handleDeleteStage}
                  />
                )
              })}
            </div>
          </SortableContext>
          
          <DragOverlay>
            {activeConversation ? (
              <div className="transform rotate-6 scale-105">
                <LeadCard 
                  conversation={activeConversation} 
                  isDragOverlay={true}
                  isAdmin={isAdmin}
                  currentUserId={currentUserId}
                />
              </div>
            ) : activeStageHeader ? (
              <div className="w-80 bg-card rounded-lg border shadow-lg transform rotate-2 scale-105">
                <SortableStageHeader
                  stage={activeStageHeader}
                  color={stageColorsMap[activeStageHeader] || '#64748b'}
                  conversationCount={crmData[activeStageHeader]?.length || 0}
                  isCustom={customStages.some(s => s.name === activeStageHeader)}
                  isDragging={true}
                  isAdmin={isAdmin}
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
