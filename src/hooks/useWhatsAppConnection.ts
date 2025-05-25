
import { useToast } from "@/hooks/use-toast"
import { WhatsAppResponse } from "@/utils/whatsappUtils"
import { useQRCodeTimer } from "./useQRCodeTimer"
import { useConnectionState } from "./useConnectionState"
import { sendInstanceData } from "@/services/webhookService"
import { processQRCodeResponse } from "@/utils/qrCodeProcessor"

interface UseWhatsAppConnectionProps {
  onConnect: () => Promise<WhatsAppResponse>
  instanceName: string // Adicionar o instanceName como prop
}

export const useWhatsAppConnection = ({ onConnect, instanceName }: UseWhatsAppConnectionProps) => {
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
    resetState,
    handleNewConnection,
    handleImageError,
    handleImageLoad,
    retryQrCode
  } = useConnectionState()

  // Timer simples para o QR Code (60 segundos)
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
    isActive: !!qrCodeData && !connectionResult
  })

  const handleConnect = async () => {
    setIsConnecting(true)
    resetState()

    try {
      console.log('🔄 Conectando com instanceName:', instanceName)
      const response = await onConnect()
      
      // Passar o instanceName original para o processador
      const processedResponse = processQRCodeResponse(response, instanceName)
      
      if (processedResponse.qrCodeData) {
        setQrCodeData(processedResponse.qrCodeData)
        setInstanceName(processedResponse.instanceName)
        
        // Enviar dados da instância para o webhook com o nome correto
        console.log('📤 Enviando instanceName para webhook:', processedResponse.instanceName)
        await sendInstanceData(processedResponse.instanceName)
        
        resetTimer()
        
        toast({
          title: "QR Code gerado!",
          description: "Escaneie o QR Code com seu WhatsApp para conectar.",
        })
      } else if (processedResponse.message) {
        setConnectionResult(processedResponse.message)
        setInstanceName(processedResponse.instanceName)
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

  return {
    isConnecting,
    qrCodeData,
    connectionResult,
    imageError,
    instanceName: storedInstanceName,
    timeLeft,
    isExpired,
    formattedTime,
    handleConnect,
    handleNewConnection,
    handleImageError,
    handleImageLoad,
    retryQrCode
  }
}
