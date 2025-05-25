
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tables } from "@/integrations/supabase/types"

type AgentType = Tables<'agents'>['type']
type AgentStatus = Tables<'agents'>['status']

interface CreateAgentDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateAgent: (agentData: {
    name: string
    type: AgentType
    status: AgentStatus
    description?: string
  }) => void
  isCreating?: boolean
}

export const CreateAgentDialog = ({ 
  isOpen, 
  onClose, 
  onCreateAgent, 
  isCreating = false 
}: CreateAgentDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "" as AgentType,
    status: "inactive" as AgentStatus,
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.type) {
      onCreateAgent({
        name: formData.name,
        type: formData.type,
        status: formData.status,
        description: formData.description || undefined,
      })
      setFormData({
        name: "",
        type: "" as AgentType,
        status: "inactive",
        description: "",
      })
      onClose()
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "vendas": return "Vendas"
      case "atendimento": return "Atendimento"
      case "marketing": return "Marketing"
      case "rh": return "RH"
      case "personalizado": return "Personalizado"
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativo"
      case "inactive": return "Inativo"
      case "training": return "Treinando"
      default: return status
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-abba-black border-abba-gray max-w-md">
        <DialogHeader>
          <DialogTitle className="text-abba-text">Criar Novo Agente</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure as informações básicas do seu novo agente digital
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-abba-text mb-2 block">
              Nome do Agente
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Agente Vendas Pro"
              className="bg-abba-gray border-abba-gray text-abba-text"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-abba-text mb-2 block">
              Tipo do Agente
            </label>
            <Select 
              value={formData.type} 
              onValueChange={(value: AgentType) => setFormData({ ...formData, type: value })}
              required
            >
              <SelectTrigger className="bg-abba-gray border-abba-gray text-abba-text">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendas">{getTypeLabel("vendas")}</SelectItem>
                <SelectItem value="atendimento">{getTypeLabel("atendimento")}</SelectItem>
                <SelectItem value="marketing">{getTypeLabel("marketing")}</SelectItem>
                <SelectItem value="rh">{getTypeLabel("rh")}</SelectItem>
                <SelectItem value="personalizado">{getTypeLabel("personalizado")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-abba-text mb-2 block">
              Status Inicial
            </label>
            <Select 
              value={formData.status} 
              onValueChange={(value: AgentStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="bg-abba-gray border-abba-gray text-abba-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inactive">{getStatusLabel("inactive")}</SelectItem>
                <SelectItem value="training">{getStatusLabel("training")}</SelectItem>
                <SelectItem value="active">{getStatusLabel("active")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-abba-text mb-2 block">
              Descrição (Opcional)
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o propósito e funcionalidades do agente..."
              className="bg-abba-gray border-abba-gray text-abba-text"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-abba-green text-abba-black hover:bg-abba-green-light"
              disabled={isCreating || !formData.name || !formData.type}
            >
              {isCreating ? "Criando..." : "Criar Agente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
