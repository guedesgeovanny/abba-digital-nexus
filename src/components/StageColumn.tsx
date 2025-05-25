
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, MoreVertical, Edit2, Palette, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LeadCard } from "./LeadCard"

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

interface StageColumnProps {
  stage: string
  stageDeals: any[]
  filteredStageDeals: any[]
  stageColorsMap: Record<string, string>
  stages: string[]
  getTotalValue: (stageDeals: any[]) => string
  onStageRename: (oldName: string, newName: string) => void
  onColorChange: (stage: string, color: string) => void
  onRemoveStage: (stage: string) => void
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
}: StageColumnProps) => {
  const [editingStage, setEditingStage] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")

  const handleStageEdit = (stageName: string) => {
    setEditingStage(stageName)
    setEditingValue(stageName)
  }

  const handleStageRename = () => {
    if (editingStage && editingValue.trim()) {
      onStageRename(editingStage, editingValue.trim())
    }
    setEditingStage(null)
    setEditingValue("")
  }

  return (
    <div className="flex-shrink-0 w-80 h-full">
      <Card className="bg-abba-black border-2 h-full flex flex-col" style={{ borderColor: stageColorsMap[stage] }}>
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            {editingStage === stage ? (
              <Input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={handleStageRename}
                onKeyDown={(e) => e.key === 'Enter' && handleStageRename()}
                className="bg-abba-gray border-abba-gray text-abba-text text-lg font-medium"
                autoFocus
              />
            ) : (
              <CardTitle className="text-abba-text text-lg">{stage}</CardTitle>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {filteredStageDeals.length}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStageEdit(stage)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar Nome
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {}}
                    className="focus:bg-transparent"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    <div className="flex gap-1">
                      {stageColors.map((color) => (
                        <button
                          key={color}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                          onClick={() => onColorChange(stage, color)}
                        />
                      ))}
                    </div>
                  </DropdownMenuItem>
                  {stages.length > 1 && (
                    <DropdownMenuItem 
                      onClick={() => onRemoveStage(stage)}
                      className="text-red-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remover
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription className="text-gray-400">
            {getTotalValue(stageDeals)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 space-y-3">
            <SortableContext 
              items={filteredStageDeals.map(deal => deal.id)} 
              strategy={verticalListSortingStrategy}
            >
              {filteredStageDeals.map((deal) => (
                <LeadCard 
                  key={deal.id} 
                  deal={deal} 
                  stageColor={stageColorsMap[stage]} 
                />
              ))}
            </SortableContext>
          </div>
          
          <div className="flex-shrink-0 p-6 pt-3">
            <Button 
              variant="outline" 
              className="w-full border-dashed border-abba-gray text-gray-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Lead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
