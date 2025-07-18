import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AgentForm } from "@/components/AgentForm"
import { Tables } from "@/integrations/supabase/types"
import { useToast } from "@/hooks/use-toast"

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
    whatsapp_profile_name?: string
    whatsapp_contact?: string
    whatsapp_profile_picture_url?: string
    whatsapp_profile_picture_data?: string
  }) => void
  onWhatsAppConnectionSuccess?: () => void
  isCreating?: boolean
  createdAgentId?: string | null
}

export const CreateAgentDialog = ({ 
  isOpen, 
  onClose, 
  onCreateAgent, 
  onWhatsAppConnectionSuccess,
  isCreating = false,
  createdAgentId 
}: CreateAgentDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "" as AgentType,
    status: "inactive" as AgentStatus,
    description: "",
    channel: "" as AgentChannel,
  })
  const [whatsAppState, setWhatsAppState] = useState<{
    hasQRCode: boolean
    isConnected: boolean
    instanceName: string | null
    profileData: {
      profileName: string
      contact: string
      profilePictureUrl: string
      profilePictureData: string
    } | null
  }>({
    hasQRCode: false,
    isConnected: false,
    instanceName: null,
    profileData: null
  })
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const { toast } = useToast()

  console.log('🔍 CreateAgentDialog recebeu createdAgentId:', createdAgentId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.type) {
      const instanceName = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const configuration = formData.channel === 'whatsapp' ? {
        evolution_instance_name: instanceName,
        evolution_api_key: "673dc3960df85e704b3db2f1362f0e99",
        connection_status: whatsAppState.isConnected ? 'connected' : 'disconnected'
      } : undefined

      const agentData = {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        description: formData.description || undefined,
        channel: formData.channel || undefined,
        configuration,
        // Incluir dados do WhatsApp se disponíveis
        whatsapp_profile_name: whatsAppState.profileData?.profileName,
        whatsapp_contact: whatsAppState.profileData?.contact,
        whatsapp_profile_picture_url: whatsAppState.profileData?.profilePictureUrl,
        whatsapp_profile_picture_data: whatsAppState.profileData?.profilePictureData,
      }

      console.log('📤 Enviando dados do agente incluindo WhatsApp:', agentData)
      onCreateAgent(agentData)
    }
  }

  const handleWhatsAppConnect = async () => {
    try {
      const instanceName = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      // Atualizar estado para indicar que QR code foi gerado
      setWhatsAppState(prev => ({
        ...prev,
        hasQRCode: true,
        instanceName: instanceName
      }))
      
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
        // Se conectou automaticamente, atualizar estado
        setWhatsAppState(prev => ({
          ...prev,
          isConnected: true
        }))
        
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

  const handleWhatsAppConnectionSuccess = (profileData: {
    profileName: string
    contact: string
    profilePictureUrl: string
    profilePictureData?: string
  }) => {
    console.log('✅ WhatsApp conectado com sucesso! Salvando dados do perfil:', profileData)
    
    // Atualizar estado com os dados do perfil
    setWhatsAppState(prev => ({
      ...prev,
      isConnected: true,
      profileData: {
        profileName: profileData.profileName,
        contact: profileData.contact,
        profilePictureUrl: profileData.profilePictureUrl,
        profilePictureData: profileData.profilePictureData || ''
      }
    }))
    
    toast({
      title: "WhatsApp Conectado!",
      description: `Conectado como ${profileData.profileName}. Agora você pode criar o agente com os dados do WhatsApp.`,
    })
  }

  const handleCancelWithConfirmation = () => {
    // Verificar se precisa de confirmação
    const needsConfirmation = whatsAppState.hasQRCode || whatsAppState.isConnected
    
    if (needsConfirmation) {
      setShowCancelConfirm(true)
    } else {
      handleClose()
    }
  }

  const handleConfirmedCancel = async () => {
    setIsCanceling(true)
    
    try {
      if (whatsAppState.instanceName) {
        if (whatsAppState.isConnected) {
          // Se estiver conectado, desconectar contato
          console.log('🗑️ Desconectando contato:', whatsAppState.instanceName)
          
          const response = await fetch('https://webhook.abbadigital.com.br/webhook/desconecta-contato', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              instanceName: whatsAppState.instanceName,
              contato: whatsAppState.profileData?.contact || "pending"
            }),
          })
          
          console.log('📡 Resposta desconectar contato:', response.status, response.statusText)
          
        } else if (whatsAppState.hasQRCode) {
          // Se apenas gerou QR code, excluir instância
          console.log('🗑️ Excluindo instância:', whatsAppState.instanceName)
          
          const response = await fetch('https://webhook.abbadigital.com.br/webhook/exclui-instancia', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              instanceName: whatsAppState.instanceName
            }),
          })
          
          console.log('📡 Resposta excluir instância:', response.status, response.statusText)
        }
      }
      
      toast({
        title: "Criação cancelada",
        description: "A criação do agente foi cancelada e as conexões foram removidas.",
      })
      
    } catch (error) {
      console.error('❌ Erro ao cancelar:', error)
      toast({
        title: "Erro ao cancelar",
        description: "Ocorreu um erro ao cancelar. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsCanceling(false)
      setShowCancelConfirm(false)
      handleClose()
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
    setWhatsAppState({
      hasQRCode: false,
      isConnected: false,
      instanceName: null,
      profileData: null
    })
    setShowCancelConfirm(false)
    onClose()
  }

  const handleCreateAgent = () => {
    // Chamar o callback original que fecha o dialog
    onWhatsAppConnectionSuccess?.()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
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
              onWhatsAppConnectionSuccess={handleWhatsAppConnectionSuccess}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancelWithConfirmation}
                disabled={isCanceling}
              >
                {isCanceling ? "Cancelando..." : "Cancelar"}
              </Button>
              <Button 
                type="submit" 
                className="bg-abba-green text-abba-black hover:bg-abba-green-light"
                disabled={isCreating || !formData.name || !formData.type}
                onClick={handleCreateAgent}
              >
                {isCreating ? "Criando..." : "Criar Agente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar criação do agente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a criação do agente? 
              {whatsAppState.isConnected 
                ? " A conexão WhatsApp atual será desconectada e perdida."
                : whatsAppState.hasQRCode 
                ? " O processo de conexão WhatsApp será perdido."
                : ""
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>
              Continuar criando
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedCancel}
              className="bg-red-600 hover:bg-red-700"
              disabled={isCanceling}
            >
              {isCanceling ? "Cancelando..." : "Sim, cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
