
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AgentForm } from "@/components/AgentForm"
import { Tables } from "@/integrations/supabase/types"

type AgentType = Tables<'agents'>['type']
type AgentStatus = Tables<'agents'>['status']
type AgentChannel = Tables<'agents'>['channel']

interface CreateAgentDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateAgent: (agentData: {
    name: string
    type: AgentType
    status: AgentStatus
    description?: string
    channel?: AgentChannel
    configuration?: any
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
    channel: "" as AgentChannel,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.type) {
      const instanceName = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const configuration = formData.channel === 'whatsapp' ? {
        evolution_instance_name: instanceName,
        evolution_api_key: "673dc3960df85e704b3db2f1362f0e99",
        connection_status: 'disconnected'
      } : undefined

      onCreateAgent({
        name: formData.name,
        type: formData.type,
        status: formData.status,
        description: formData.description || undefined,
        channel: formData.channel || undefined,
        configuration,
      })
      
      // Reset form
      setFormData({
        name: "",
        type: "" as AgentType,
        status: "inactive",
        description: "",
        channel: "" as AgentChannel,
      })
      onClose()
    }
  }

  const handleWhatsAppConnect = async () => {
    try {
      const instanceName = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const response = await fetch('https://webhook.abbadigital.com.br/webhook/nova-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentName: formData.name,
          agentType: formData.type,
          channel: 'whatsapp',
          instanceName: instanceName,
          apiKey: "673dc3960df85e704b3db2f1362f0e99",
        }),
      })

      if (!response.ok) {
        throw new Error('Erro na requisição')
      }

      const data = await response.json()
      console.log('Resposta da API:', data)
      
      return {
        code: data.code,
        base64: data.base64,
        message: data.message
      }
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error)
      throw error
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-abba-black border-abba-gray max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-abba-text">Criar Novo Agente</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure as informações básicas do seu novo agente digital
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <AgentForm
            formData={formData}
            setFormData={setFormData}
            onWhatsAppConnect={handleWhatsAppConnect}
          />

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
