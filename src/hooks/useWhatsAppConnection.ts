import { useToast } from "@/hooks/use-toast"
import { WhatsAppResponse, ProfileData } from "@/utils/whatsappUtils"
import { useQRCodeTimer } from "./useQRCodeTimer"
import { useConnectionState } from "./useConnectionState"
import { useProfilePolling } from "./useProfilePolling"
import { sendInstanceData, deleteInstanceConnection } from "@/services/webhookService"
import { processQRCodeResponse } from "@/utils/qrCodeProcessor"

interface UseWhatsAppConnectionProps {
  onConnect: () => Promise<WhatsAppResponse>
  instanceName: string
  agentId?: string
  onConnectionSuccess?: (profileData: {
    profileName: string
    contact: string
    profilePictureUrl: string
    profilePictureData?: string
  }) => void
}

export const useWhatsAppConnection = ({ 
  onConnect, 
  instanceName, 
  agentId,
  onConnectionSuccess 
}: UseWhatsAppConnectionProps) => {
  const { toast } = useToast()
  
  const {
    isConnecting,
    setIsConnecting,
    qrCodeData,
    setQrCodeData,
    connectionResult,
    setConnectionResult,
    imageError,
    instanceName: storedInstanceName,
    setInstanceName,
    profileData,
    setProfileData,
    isDeleting,
    setIsDeleting,
    resetState,
    handleNewConnection,
    handleImageError,
    handleImageLoad,
    retryQrCode
  } = useConnectionState()

  // Timer para o QR Code (60 segundos)
  const {
    timeLeft,
    isExpired,
    resetTimer,
    formattedTime
  } = useQRCodeTimer({
    duration: 60,
    onExpire: () => {
      console.log('⏰ QR Code expirado')
      toast({
        title: "QR Code Expirado",
        description: "Gere um novo QR Code para continuar.",
        variant: "destructive",
      })
    },
    isActive: !!qrCodeData && !connectionResult && !profileData
  })

  // Polling para buscar dados do perfil - só ativo enquanto o timer não expirou
  const { isPolling } = useProfilePolling({
    instanceName: storedInstanceName,
    agentId,
    isActive: !!qrCodeData && !connectionResult && !profileData && !isExpired,
    onProfileReceived: (receivedProfileData: ProfileData & { profilePictureData?: string }) => {
      console.log('✅ Perfil recebido via polling:', receivedProfileData)
      setProfileData(receivedProfileData)
      setConnectionResult("WhatsApp conectado com sucesso!")
      
      // Chamar callback de sucesso com dados completos do perfil
      onConnectionSuccess?.({
        profileName: receivedProfileData.profileName,
        contact: receivedProfileData.contact,
        profilePictureUrl: receivedProfileData.profilePictureUrl,
        profilePictureData: receivedProfileData.profilePictureData
      })
      
      toast({
        title: "WhatsApp Conectado!",
        description: `Conectado como ${receivedProfileData.profileName}`,
      })
    }
  })

  const handleConnect = async () => {
    setIsConnecting(true)
    resetState()

    try {
      console.log('🔄 Conectando com instanceName:', instanceName)
      const response = await onConnect()
      
      const processedResponse = processQRCodeResponse(response, instanceName)
      
      if (processedResponse.qrCodeData) {
        setQrCodeData(processedResponse.qrCodeData)
        setInstanceName(processedResponse.instanceName)
        
        console.log('📤 Enviando instanceName para webhook:', processedResponse.instanceName)
        await sendInstanceData(processedResponse.instanceName)
        
        resetTimer()
        
        toast({
          title: "QR Code gerado!",
          description: "Escaneie o QR Code com seu WhatsApp. Aguardando conexão...",
        })
      } else if (processedResponse.message) {
        setConnectionResult(processedResponse.message)
        setInstanceName(processedResponse.instanceName)
        
        // Chamar callback de sucesso se conectou automaticamente
        onConnectionSuccess?.({
          profileName: '',
          contact: '',
          profilePictureUrl: '',
          profilePictureData: ''
        })
        
        toast({
          title: "Conexão realizada!",
          description: "WhatsApp conectado com sucesso.",
        })
      }
    } catch (error) {
      console.error("=== ERRO AO CONECTAR WHATSAPP ===")
      console.error("Erro completo:", error)
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar o WhatsApp. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDeleteConnection = async () => {
    if (!storedInstanceName) return

    setIsDeleting(true)
    
    try {
      console.log('🗑️ Deletando conexão:', storedInstanceName)
      const success = await deleteInstanceConnection(storedInstanceName)
      
      if (success) {
        resetState()
        toast({
          title: "Conexão removida",
          description: "A conexão WhatsApp foi removida com sucesso.",
        })
      } else {
        toast({
          title: "Erro ao remover conexão",
          description: "Não foi possível remover a conexão. Tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Erro ao deletar conexão:', error)
      toast({
        title: "Erro ao remover conexão",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    isConnecting,
    qrCodeData,
    connectionResult,
    imageError,
    instanceName: storedInstanceName,
    profileData,
    isDeleting,
    isPolling,
    timeLeft,
    isExpired,
    formattedTime,
    handleConnect,
    handleNewConnection,
    handleDeleteConnection,
    handleImageError,
    handleImageLoad,
    retryQrCode
  }
}
