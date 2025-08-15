import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface SortableStageHeaderProps {
  stage: string
  color: string
  conversationCount: number
  isCustom: boolean
  isDragging?: boolean
  isAdmin?: boolean
}

export const SortableStageHeader = ({ 
  stage, 
  color, 
  conversationCount, 
  isCustom,
  isDragging = false,
  isAdmin = false
}: SortableStageHeaderProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: `stage-header-${stage}`,
    disabled: !isCustom || !isAdmin, // Only custom stages can be reordered and only by admins
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`
        p-4 border-b border-border bg-card/50
        ${isCustom && isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2 mb-2">
        {isCustom && isAdmin && (
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        )}
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0" 
          style={{ backgroundColor: color }}
        />
        <h3 className="font-medium text-card-foreground flex-1">{stage}</h3>
        {isCustom && !isAdmin && (
          <span className="text-xs text-muted-foreground">
            (Somente admin pode reordenar)
          </span>
        )}
      </div>
      
      <Badge variant="outline" className="border-border">
        {conversationCount} conversas
      </Badge>
    </div>
  )
}