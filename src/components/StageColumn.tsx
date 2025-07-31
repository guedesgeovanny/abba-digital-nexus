
import { Badge } from "@/components/ui/badge"
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LeadCard } from "./LeadCard"
import { CRMConversation } from "@/hooks/useCRMConversations"

interface StageColumnProps {
  stage: string
  conversations: CRMConversation[]
  stageColorsMap: Record<string, string>
  onCardClick?: (conversation: CRMConversation) => void
  isAdmin?: boolean
  currentUserId?: string
}

export const StageColumn = ({
  stage,
  conversations,
  stageColorsMap,
  onCardClick,
  isAdmin,
  currentUserId
}: StageColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: stage,
  })

  const stageColor = stageColorsMap[stage] || '#64748b'

  return (
    <div 
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-80 bg-abba-black rounded-lg border transition-colors duration-200
        ${isOver ? 'border-abba-green bg-abba-green/5 shadow-lg shadow-abba-green/20' : 'border-abba-gray'}
      `}
    >
      {/* Header do estágio */}
      <div className="p-4 border-b border-abba-gray">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: stageColor }}
          />
          <h3 className="font-medium text-abba-text">{stage}</h3>
        </div>
        
        <Badge variant="outline" className="border-gray-600">
          {conversations.length} conversas
        </Badge>
      </div>
      
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
            ${isOver ? 'border-abba-green bg-abba-green/10' : 'border-gray-600'}
          `}>
            <div className="text-gray-400">
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
