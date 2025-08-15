import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CustomStage } from "@/hooks/useCRMConversations"

interface EditStageDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (stageId: string, name: string, color: string) => Promise<void>
  stage: CustomStage | null
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280', // gray
  '#14b8a6', // teal
  '#a855f7'  // purple
]

export const EditStageDialog = ({ isOpen, onClose, onUpdate, stage }: EditStageDialogProps) => {
  const [stageName, setStageName] = useState(stage?.name || "")
  const [selectedColor, setSelectedColor] = useState(stage?.color || '#6366f1')
  const [isUpdating, setIsUpdating] = useState(false)

  // Update local state when stage changes
  useEffect(() => {
    if (stage) {
      setStageName(stage.name)
      setSelectedColor(stage.color)
    }
  }, [stage])

  const handleUpdate = async () => {
    if (!stage || !stageName.trim()) return

    setIsUpdating(true)
    try {
      await onUpdate(stage.id, stageName.trim(), selectedColor)
      onClose()
    } catch (error) {
      console.error('Error updating stage:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClose = () => {
    // Reset form when closing
    if (stage) {
      setStageName(stage.name)
      setSelectedColor(stage.color)
    }
    onClose()
  }

  if (!stage) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Editar Etapa</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Altere o nome e a cor da etapa personalizada
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stage-name" className="text-card-foreground">Nome da Etapa</Label>
            <Input
              id="stage-name"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="Digite o nome da etapa"
              className="bg-background border-border text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-card-foreground">Cor da Etapa</Label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all
                    ${selectedColor === color 
                      ? 'border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background' 
                      : 'border-border hover:border-foreground'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  aria-label={`Selecionar cor ${color}`}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Label htmlFor="custom-color" className="text-card-foreground">Cor personalizada:</Label>
              <input
                id="custom-color"
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">{selectedColor}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0" 
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-sm font-medium text-card-foreground">
              Preview: {stageName || 'Nome da etapa'}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdate} 
            disabled={!stageName.trim() || isUpdating}
            className="bg-abba-green text-abba-black hover:bg-abba-green-light"
          >
            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}