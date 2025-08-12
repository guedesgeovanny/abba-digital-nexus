import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { validateConnectionName } from "@/utils/connectionValidation"

interface ConnectionNameModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (name: string) => void
  isLoading?: boolean
}

export function ConnectionNameModal({ open, onOpenChange, onConfirm, isLoading = false }: ConnectionNameModalProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    const validationError = validateConnectionName(name)
    if (validationError) {
      setError(validationError)
      return
    }
    onConfirm(name)
    setName("")
    setError("")
  }

  const handleInputChange = (value: string) => {
    setName(value)
    if (error) {
      setError("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Conexão WhatsApp</DialogTitle>
          <DialogDescription>
            Digite um nome único para identificar esta conexão.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <div className="col-span-3">
              <Input
                id="name"
                placeholder="ex: conexao_principal"
                value={name}
                onChange={(e) => handleInputChange(e.target.value)}
                className={error ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Regras:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>3 a 30 caracteres</li>
              <li>Apenas letras, números, _ e -</li>
              <li>Sem espaços</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? "Criando..." : "Criar Conexão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}