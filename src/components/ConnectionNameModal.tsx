import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateConnectionName } from "@/utils/connectionValidation"

interface ConnectionNameModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (name: string) => void
  isLoading?: boolean
}

export function ConnectionNameModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false
}: ConnectionNameModalProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateConnectionName(name)
    if (validationError) {
      setError(validationError)
      return
    }

    onConfirm(name)
    setName("")
    setError("")
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (error) {
      setError("")
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setName("")
      setError("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conexão WhatsApp</DialogTitle>
          <DialogDescription>
            Digite um nome único para sua conexão. Use apenas letras, números, _ e -.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connection-name">Nome da Conexão</Label>
            <Input
              id="connection-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="minha-conexao-whats"
              disabled={isLoading}
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              • 3-30 caracteres<br/>
              • Apenas letras, números, _ e -<br/>
              • Sem espaços
            </p>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? "Criando..." : "Criar Conexão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}