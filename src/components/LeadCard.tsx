
import { Card, CardContent } from "@/components/ui/card"
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CRMConversation } from '@/hooks/useCRMConversations'

interface LeadCardProps {
  conversation: CRMConversation
  onCardClick?: (conversation: CRMConversation) => void
  isDragOverlay?: boolean
}

export const LeadCard = ({ conversation, onCardClick, isDragOverlay = false }: LeadCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: conversation.id,
    disabled: isDragOverlay
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDragging) return
    
    onCardClick?.(conversation)
  }

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...(!isDragOverlay ? attributes : {})} 
      {...(!isDragOverlay ? listeners : {})}
      onClick={handleCardClick}
      className={`
        bg-abba-gray border-abba-gray transition-all duration-200 cursor-pointer
        hover:border-abba-green hover:shadow-lg hover:shadow-abba-green/20 hover:scale-[1.02]
        ${isDragging && !isDragOverlay ? 'opacity-50' : ''}
        ${isDragOverlay ? 'shadow-2xl shadow-abba-green/40 border-abba-green' : ''}
      `}
    >
      <CardContent className="p-4">
        <h4 className="font-medium text-abba-text">{conversation.contact_name}</h4>
      </CardContent>
    </Card>
  )
}
