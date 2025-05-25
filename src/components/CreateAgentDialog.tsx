
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
      console.log('Tipo da resposta:', typeof data)
      console.log('Keys da resposta:', Object.keys(data || {}))
      
      // Verificar a nova estrutura JSON
      if (data.qrcode) {
        console.log('=== OBJETO QRCODE ENCONTRADO ===')
        console.log('QRCode object:', JSON.stringify(data.qrcode, null, 2))
        console.log('QRCode keys:', Object.keys(data.qrcode))
        
        if (data.qrcode.code) {
          console.log('✅ Code encontrado:', data.qrcode.code)
        } else {
          console.log('❌ Code não encontrado')
        }
        
        if (data.qrcode.base64) {
          console.log('✅ Base64 encontrado')
          console.log('Tamanho do base64:', data.qrcode.base64.length)
          console.log('Primeiros 50 chars:', data.qrcode.base64.substring(0, 50))
          console.log('Últimos 50 chars:', data.qrcode.base64.substring(data.qrcode.base64.length - 50))
        } else {
          console.log('❌ Base64 não encontrado')
        }
      } else {
        console.log('❌ Objeto qrcode não encontrado na resposta')
      }
      
      if (data.instanceId) {
        console.log('✅ Instance ID encontrado:', data.instanceId)
      }
      
      // Retornar os dados com a nova estrutura
      if (data.qrcode && data.qrcode.code && data.qrcode.base64) {
        return {
          code: data.qrcode.code,
          base64: data.qrcode.base64,
          instanceId: data.instanceId
        }
      } else if (data.message) {
        console.log('📝 Mensagem de conexão:', data.message)
        return {
          message: data.message,
          instanceId: data.instanceId
        }
      } else {
        console.error('❌ Estrutura de resposta inesperada:', data)
        throw new Error('Estrutura de resposta inválida da API')
      }
    } catch (error) {
      console.error("=== ERRO AO CONECTAR WHATSAPP ===")
      console.error("Tipo do erro:", typeof error)
      console.error("Erro completo:", error)
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
