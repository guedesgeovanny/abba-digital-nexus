
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { isValidBase64, QRCodeData, WhatsAppResponse } from "@/utils/whatsappUtils"
import { useQRCodeTimer } from "./useQRCodeTimer"
import { useConnectionStatus } from "./useConnectionStatus"

interface ProfileData {
  profilePictureUrl: string
  owner: string
  profileName: string
}

interface UseWhatsAppConnectionProps {
  onConnect: () => Promise<WhatsAppResponse>
}

export const useWhatsAppConnection = ({ onConnect }: UseWhatsAppConnectionProps) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null)
  const [connectionResult, setConnectionResult] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [instanceName, setInstanceName] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const { toast } = useToast()

  // Timer para o QR Code
  const {
    timeLeft,
    isExpired,
    resetTimer,
    formattedTime
  } = useQRCodeTimer({
    duration: 60,
    onExpire: () => {
      console.log('QR Code expirado')
      toast({
        title: "QR Code Expirado",
        description: "Gere um novo QR Code para continuar.",
        variant: "destructive",
      })
    },
    isActive: !!qrCodeData && !connectionResult && !profileData
  })

  // Verificação de status da conexão
  const { connectionStatus, resetStatus } = useConnectionStatus({
    instanceName,
    isActive: !!qrCodeData && !isExpired && !connectionResult && !profileData,
    onConnected: (profile) => {
      setProfileData(profile)
      setConnectionResult("WhatsApp conectado com sucesso!")
      setQrCodeData(null)
    }
  })

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionResult(null)
    setQrCodeData(null)
    setImageError(false)
    setInstanceName(null)
    setProfileData(null)
    resetStatus()

    try {
      const response = await onConnect()
      console.log('=== RESPOSTA COMPLETA DA API ===')
      console.log('Estrutura da resposta:', JSON.stringify(response, null, 2))
      
      if (response.code && response.base64) {
        if (!isValidBase64(response.base64)) {
          console.error('Base64 inválido recebido!')
          toast({
            title: "Erro no QR Code",
            description: "Dados do QR Code inválidos. Tente novamente.",
            variant: "destructive",
          })
          return
        }

        setQrCodeData({
          code: response.code,
          base64: response.base64
        })
        
        // Extrair nome da instância do código (assumindo que está no formato esperado)
        setInstanceName(response.code)
        
        resetTimer()
        
        toast({
          title: "QR Code gerado!",
          description: "Escaneie o QR Code com seu WhatsApp para conectar.",
        })
      } else if (response.message) {
        console.log('Mensagem de conexão:', response.message)
        setConnectionResult(response.message)
        toast({
          title: "Conexão realizada!",
          description: "WhatsApp conectado com sucesso.",
        })
      } else {
        console.error('Resposta inesperada da API:', response)
        toast({
          title: "Resposta inesperada",
          description: "A API retornou dados inesperados. Verifique o console.",
          variant: "destructive",
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

  const handleNewConnection = () => {
    setQrCodeData(null)
    setConnectionResult(null)
    setImageError(false)
    setInstanceName(null)
    setProfileData(null)
    resetStatus()
    resetTimer()
  }

  const handleImageError = () => {
    console.error('=== ERRO AO CARREGAR IMAGEM DO QR CODE ===')
    setImageError(true)
  }

  const handleImageLoad = () => {
    console.log('✅ QR Code carregado com sucesso!')
    setImageError(false)
  }

  const retryQrCode = () => {
    console.log('🔄 Tentando recarregar QR Code...')
    setImageError(false)
    const img = document.querySelector('#qr-code-img') as HTMLImageElement
    if (img && qrCodeData) {
      img.src = `data:image/png;base64,${qrCodeData.base64}`
    }
  }

  return {
    isConnecting,
    qrCodeData,
    connectionResult,
    imageError,
    instanceName,
    timeLeft,
    isExpired,
    formattedTime,
    connectionStatus,
    profileData,
    handleConnect,
    handleNewConnection,
    handleImageError,
    handleImageLoad,
    retryQrCode
  }
}
