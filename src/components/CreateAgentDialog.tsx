
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
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.type) {
      const instanceName = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const configuration = formData.channel === 'whatsapp' ? {
        evolution_instance_name: instanceName,
        evolution_api_key: "673dc3960df85e704b3db2f1362f0e99",
        connection_status: 'disconnected'
      } : undefined

      // Criar agente
      const agentData = {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        description: formData.description || undefined,
        channel: formData.channel || undefined,
        configuration,
      }

      // Usar uma Promise para capturar o resultado
      const createAgentPromise = new Promise((resolve) => {
        const originalOnCreateAgent = onCreateAgent
        onCreateAgent = (data) => {
          originalOnCreateAgent(data)
          // Simular que temos acesso ao agente criado - na prática isso virá do callback de sucesso
          // Por enquanto, vamos usar um setTimeout para simular a criação
          setTimeout(() => {
            // Este ID seria fornecido pelo callback de sucesso real
            const mockAgentId = 'temp-' + Date.now()
            setCreatedAgentId(mockAgentId)
            resolve(mockAgentId)
          }, 100)
        }
      })

      onCreateAgent(agentData)
      
      // Se não for WhatsApp, fechar imediatamente
      if (formData.channel !== 'whatsapp') {
        handleClose()
      }
    }
  }

  // Função para receber o ID do agente criado do componente pai
  const handleAgentCreated = (agentId: string) => {
    setCreatedAgentId(agentId)
  }

  const handleWhatsAppConnect = async () => {
    try {
      const instanceName = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      console.log('=== ENVIANDO REQUISIÇÃO PARA API ===')
      console.log('Instance Name:', instanceName)
      
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
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log('=== RESPOSTA COMPLETA DA API ===')
      console.log('Estrutura da resposta:', JSON.stringify(data, null, 2))
      
      // Verificar se os dados estão diretamente no root (nova estrutura)
      if (data.code && data.base64) {
        console.log('✅ Dados encontrados no root da resposta')
        
        let cleanBase64 = data.base64
        if (data.base64.startsWith('data:image/')) {
          cleanBase64 = data.base64.split(',')[1]
        }
        
        return {
          code: data.code,
          base64: cleanBase64,
          instanceId: data.instanceId
        }
      }
      
      // Verificar estrutura aninhada (compatibilidade)
      if (data.qrcode && data.qrcode.code && data.qrcode.base64) {
        console.log('✅ Dados encontrados em data.qrcode')
        
        let cleanBase64 = data.qrcode.base64
        if (data.qrcode.base64.startsWith('data:image/')) {
          cleanBase64 = data.qrcode.base64.split(',')[1]
        }
        
        return {
          code: data.qrcode.code,
          base64: cleanBase64,
          instanceId: data.instanceId
        }
      }
      
      if (data.message) {
        return {
          message: data.message,
          instanceId: data.instanceId
        }
      }
      
      throw new Error('Dados do QR Code não encontrados na resposta da API')
      
    } catch (error) {
      console.error("=== ERRO AO CONECTAR WHATSAPP ===", error)
      throw error
    }
  }

  const handleClose = () => {
    setFormData({
      name: "",
      type: "" as AgentType,
      status: "inactive",
      description: "",
      channel: "" as AgentChannel,
    })
    setCreatedAgentId(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
            agentId={createdAgentId}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
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
