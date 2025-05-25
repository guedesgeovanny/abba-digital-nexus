
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { isValidBase64, QRCodeData, WhatsAppResponse } from "@/utils/whatsappUtils"
import { useQRCodeTimer } from "./useQRCodeTimer"

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
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('disconnected')
  const { toast } = useToast()

  // Função para fazer polling da conexão
  const checkConnectionStatus = async (instance: string) => {
    try {
      console.log(`🔍 Verificando status da conexão para instância: ${instance}`)
      
      const response = await fetch(`https://api.abbadigital.com.br/instance/fetchInstances?instanceName=${instance}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.log(`❌ Erro na requisição: ${response.status}`)
        return false
      }

      const data = await response.json()
      console.log('📋 Resposta do fetchInstances:', JSON.stringify(data, null, 2))

      // Verificar se tem dados de perfil válidos
      if (data.profilePictureUrl && data.owner && data.profileName) {
        console.log('✅ Perfil encontrado, conexão bem-sucedida!')
        
        // Limpar o número removendo @s.whatsapp.net
        const cleanOwner = data.owner.replace('@s.whatsapp.net', '')
        
        setProfileData({
          profilePictureUrl: data.profilePictureUrl,
          owner: cleanOwner,
          profileName: data.profileName
        })
        
        setConnectionStatus('connected')
        setConnectionResult("WhatsApp conectado com sucesso!")
        setQrCodeData(null)
        
        toast({
          title: "WhatsApp Conectado!",
          description: `Conectado como ${data.profileName}`,
        })
        
        return true
      }

      return false
    } catch (error) {
      console.error('❌ Erro ao verificar status da conexão:', error)
      return false
    }
  }

  // Timer para o QR Code com polling
  const {
    timeLeft,
    isExpired,
    resetTimer,
    formattedTime
  } = useQRCodeTimer({
    duration: 60,
    onExpire: () => {
      console.log('⏰ QR Code expirado')
      setConnectionStatus('disconnected')
      toast({
        title: "QR Code Expirado",
        description: "Gere um novo QR Code para continuar.",
        variant: "destructive",
      })
    },
    isActive: !!qrCodeData && !connectionResult && !profileData,
    onTick: async () => {
      // Fazer polling a cada tick (3-5 segundos) se temos uma instância
      if (instanceName && connectionStatus === 'checking') {
        const isConnected = await checkConnectionStatus(instanceName)
        if (isConnected) {
          // Conexão bem-sucedida, o timer será parado automaticamente
          return
        }
      }
    }
  })

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionResult(null)
    setQrCodeData(null)
    setImageError(false)
    setInstanceName(null)
    setProfileData(null)
    setConnectionStatus('disconnected')

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
        
        // Extrair nome da instância do código
        const extractedInstanceName = response.code
        setInstanceName(extractedInstanceName)
        setConnectionStatus('checking')
        
        console.log(`📱 Instância criada: ${extractedInstanceName}`)
        console.log('🔄 Iniciando verificação de conexão...')
        
        resetTimer()
        
        toast({
          title: "QR Code gerado!",
          description: "Escaneie o QR Code com seu WhatsApp para conectar.",
        })
      } else if (response.message) {
        console.log('📝 Mensagem de conexão:', response.message)
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
    setConnectionStatus('disconnected')
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
