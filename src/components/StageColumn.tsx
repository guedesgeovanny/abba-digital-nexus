
import { Badge } from "@/components/ui/badge"
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LeadCard } from "./LeadCard"
import { SortableStageHeader } from "./SortableStageHeader"
import { CRMConversation, CustomStage } from "@/hooks/useCRMConversations"

interface StageColumnProps {
  stage: string
  conversations: CRMConversation[]
  stageColorsMap: Record<string, string>
  onCardClick?: (conversation: CRMConversation) => void
  isAdmin?: boolean
  currentUserId?: string
  isCustom?: boolean
  isEntryStage?: boolean
  onDeleteStage?: (stageName: string) => void
  onEditStage?: (stageName: string) => void
  customStageData?: CustomStage
}

export const StageColumn = ({
  stage,
  conversations,
  stageColorsMap,
  onCardClick,
  isAdmin,
  currentUserId,
  isCustom = false,
  isEntryStage = false,
  onDeleteStage,
  onEditStage,
  customStageData
}: StageColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: stage,
  })

  const stageColor = stageColorsMap[stage] || '#64748b'
  
  // Calculate total value of conversations in this stage
  const totalValue = conversations.reduce((sum, conv) => {
    return sum + (conv.value || 0)
  }, 0)

  return (
    <div 
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-80 bg-card rounded-lg border transition-colors duration-200
        ${isOver ? 'border-abba-green bg-abba-green/5 shadow-lg shadow-abba-green/20' : 'border-border'}
      `}
    >
      {/* Header do estágio */}
      <SortableStageHeader
        stage={stage}
        color={stageColor}
        conversationCount={conversations.length}
        totalValue={totalValue}
        isCustom={isCustom}
        isEntryStage={isEntryStage}
        isAdmin={isAdmin}
        onDelete={onDeleteStage}
        onEdit={onEditStage}
        customStageData={customStageData}
      />
      
      {/* Lista de cards */}
      <div className="p-4 space-y-3 h-[calc(100vh-300px)] overflow-y-auto">
        <SortableContext 
          items={conversations.map(conv => conv.id)} 
          strategy={verticalListSortingStrategy}
        >
          {conversations.map((conversation) => (
            <LeadCard 
              key={conversation.id} 
              conversation={conversation}
              onCardClick={onCardClick}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
            />
          ))}
        </SortableContext>
        
        {conversations.length === 0 && (
          <div className={`
            text-center py-12 border-2 border-dashed rounded-lg transition-colors duration-200
            ${isOver ? 'border-abba-green bg-abba-green/10' : 'border-border'}
          `}>
            <div className="text-muted-foreground">
              {isOver ? (
                <div className="animate-pulse">
                  <div className="text-abba-green font-medium mb-1">Solte aqui</div>
                  <p className="text-sm">Para mover a conversa para "{stage}"</p>
                </div>
              ) : (
                <p className="text-sm">Nenhuma conversa neste estágio</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
