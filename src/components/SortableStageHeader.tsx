import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface SortableStageHeaderProps {
  stage: string
  color: string
  conversationCount: number
  isCustom: boolean
  isDragging?: boolean
  isAdmin?: boolean
  onDelete?: (stageName: string) => void
}

export const SortableStageHeader = ({ 
  stage, 
  color, 
  conversationCount, 
  isCustom,
  isDragging = false,
  isAdmin = false,
  onDelete
}: SortableStageHeaderProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: `stage-header-${stage}`,
    disabled: !isAdmin, // Allow all stages to be reordered by admins
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(stage)
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`
        p-4 border-b border-border bg-card/50
        ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2 mb-2">
        {isAdmin && (
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        )}
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0" 
          style={{ backgroundColor: color }}
        />
        <h3 className="font-medium text-card-foreground flex-1">{stage}</h3>
        {isCustom && isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Etapa</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a etapa "{stage}"? 
                  Todos os leads nesta etapa serão movidos para "Novo Lead". 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {!isAdmin && (
          <span className="text-xs text-muted-foreground">
            (Somente admin)
          </span>
        )}
      </div>
      
      <Badge variant="outline" className="border-border">
        {conversationCount} conversas
      </Badge>
    </div>
  )
}