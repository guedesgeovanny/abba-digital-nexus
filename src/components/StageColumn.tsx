
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Edit, Trash2, Palette } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LeadCard } from "./LeadCard"
import { CRMDeal } from "@/hooks/useCRMData"

interface StageColumnProps {
  stage: string
  stageDeals: CRMDeal[]
  filteredStageDeals: CRMDeal[]
  stageColorsMap: Record<string, string>
  stages: string[]
  getTotalValue: (deals: CRMDeal[]) => string
  onStageRename: (oldName: string, newName: string) => void
  onColorChange: (stage: string, color: string) => void
  onRemoveStage: (stage: string) => void
  onCardClick?: (deal: CRMDeal) => void
  isDragActive?: boolean
}

export const StageColumn = ({
  stage,
  stageDeals,
  filteredStageDeals,
  stageColorsMap,
  stages,
  getTotalValue,
  onStageRename,
  onColorChange,
  onRemoveStage,
  onCardClick,
  isDragActive = false
}: StageColumnProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editingName, setEditingName] = useState(stage)

  const { isOver, setNodeRef } = useDroppable({
    id: stage,
  })

  const stageColor = stageColorsMap[stage] || '#64748b'

  const handleRename = () => {
    if (editingName.trim() && editingName !== stage) {
      onStageRename(stage, editingName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setEditingName(stage)
      setIsEditing(false)
    }
  }

  const canRemoveStage = !['Novo Lead', 'Qualificado', 'Proposta', 'Fechado', 'Perdido'].includes(stage)

  return (
    <div 
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-80 bg-abba-black rounded-lg border transition-colors duration-200
        ${isOver ? 'border-abba-green bg-abba-green/5 shadow-lg shadow-abba-green/20' : 'border-abba-gray'}
        ${isDragActive && !isOver ? 'border-dashed border-gray-600 opacity-60' : ''}
      `}
    >
      {/* Header do estágio */}
      <div className="p-4 border-b border-abba-gray">
        <div className="flex items-center justify-between mb-2">
          {isEditing ? (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyPress}
              className="h-8 text-sm font-medium bg-abba-gray border-abba-gray text-abba-text"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: stageColor }}
              />
              <h3 className="font-medium text-abba-text">{stage}</h3>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Renomear
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onColorChange(stage, stageColor)}>
                <Palette className="w-4 h-4 mr-2" />
                Alterar Cor
              </DropdownMenuItem>
              {canRemoveStage && (
                <DropdownMenuItem 
                  onClick={() => onRemoveStage(stage)}
                  className="text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <Badge variant="outline" className="border-gray-600">
            {filteredStageDeals.length} leads
          </Badge>
          <span className="text-abba-green font-medium">
            {getTotalValue(filteredStageDeals)}
          </span>
        </div>
      </div>
      
      {/* Lista de cards */}
      <div className="p-4 space-y-3 h-[calc(100vh-300px)] overflow-y-auto">
        <SortableContext 
          items={filteredStageDeals.map(deal => deal.id)} 
          strategy={verticalListSortingStrategy}
        >
          {filteredStageDeals.map((deal) => (
            <LeadCard 
              key={deal.id} 
              deal={deal} 
              stageColor={stageColor}
              onCardClick={onCardClick}
            />
          ))}
        </SortableContext>
        
        {filteredStageDeals.length === 0 && (
          <div className={`
            text-center py-12 border-2 border-dashed rounded-lg transition-colors duration-200
            ${isOver ? 'border-abba-green bg-abba-green/10' : 'border-gray-600'}
            ${isDragActive ? 'border-gray-500' : 'border-transparent'}
          `}>
            <div className="text-gray-400">
              {isOver ? (
                <div className="animate-pulse">
                  <div className="text-abba-green font-medium mb-1">Solte aqui</div>
                  <p className="text-sm">Para mover o card para "{stage}"</p>
                </div>
              ) : (
                <p className="text-sm">Nenhum lead neste estágio</p>
              )}
            </div>
          </div>
        )}
        
        {/* Drop zone for when there are cards */}
        {filteredStageDeals.length > 0 && isDragActive && (
          <div className={`
            text-center py-6 border-2 border-dashed rounded-lg transition-colors duration-200 mt-3
            ${isOver ? 'border-abba-green bg-abba-green/10' : 'border-gray-600'}
          `}>
            <div className="text-gray-400">
              {isOver ? (
                <div className="animate-pulse">
                  <div className="text-abba-green font-medium mb-1">Solte aqui</div>
                  <p className="text-sm">Para mover para "{stage}"</p>
                </div>
              ) : (
                <p className="text-sm">Arrastar para "{stage}"</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
