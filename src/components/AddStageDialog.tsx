
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AddStageDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (stageName: string) => void
}

export const AddStageDialog = ({ isOpen, onClose, onAdd }: AddStageDialogProps) => {
  const [newStageName, setNewStageName] = useState("")

  const handleAddStage = () => {
    if (newStageName.trim()) {
      onAdd(newStageName.trim())
      setNewStageName("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-abba-black border-abba-gray">
        <DialogHeader>
          <DialogTitle className="text-abba-text">Adicionar Nova Etapa</DialogTitle>
          <DialogDescription className="text-gray-400">
            Digite o nome da nova etapa do pipeline
          </DialogDescription>
        </DialogHeader>
        <Input
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          placeholder="Nome da etapa..."
          className="bg-abba-gray border-abba-gray text-abba-text"
          onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAddStage} className="bg-abba-green text-abba-black hover:bg-abba-green-light">
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
