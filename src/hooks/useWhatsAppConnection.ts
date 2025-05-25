import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { isValidBase64, QRCodeData, WhatsAppResponse } from "@/utils/whatsappUtils"
import { useQRCodeTimer } from "./useQRCodeTimer"

interface UseWhatsAppConnectionProps {
  onConnect: () => Promise<WhatsAppResponse>
}

export const useWhatsAppConnection = ({ onConnect }: UseWhatsAppConnectionProps) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null)
  const [connectionResult, setConnectionResult] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [instanceName, setInstanceName] = useState<string | null>(null)
  const { toast } = useToast()

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

  // Função para enviar dados da instância via webhook
  const sendInstanceData = async (instanceName: string) => {
    try {
      console.log(`📤 Enviando dados da instância para webhook: ${instanceName}`)
      
      const response = await fetch('https://webhook.abbadigital.com.br/webhook/dados-da-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: instanceName
        }),
      })

      if (!response.ok) {
        console.error(`❌ Erro ao enviar dados da instância: ${response.status}`)
        return
      }

      console.log('✅ Dados da instância enviados com sucesso')
      
    } catch (error) {
      console.error('❌ Erro ao enviar dados da instância:', error)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionResult(null)
    setQrCodeData(null)
    setImageError(false)
    setInstanceName(null)

    try {
      const response = await onConnect()
      console.log('=== RESPOSTA COMPLETA DA API ===')
      console.log('Estrutura da resposta:', JSON.stringify(response, null, 2))
      console.log('Campos disponíveis:', Object.keys(response))
      
      if (response.code && response.base64) {
        // Processar o base64 corretamente
        let processedBase64 = response.base64
        
        // Se já tem o prefixo data:image, usar diretamente
        if (!response.base64.startsWith('data:image/')) {
          // Se não tem o prefixo, adicionar
          processedBase64 = `data:image/png;base64,${response.base64}`
        }
        
        console.log('✅ QR Code recebido com sucesso')
        console.log('Code:', response.code)
        console.log('Base64 prefix:', processedBase64.substring(0, 30))

        setQrCodeData({
          code: response.code,
          base64: processedBase64
        })
        
        // Extrair o nome da instância do campo correto - PRIORIZAR "instance-Name"
        let extractedInstanceName: string
        
        if (response["instance-Name"]) {
          extractedInstanceName = response["instance-Name"]
          console.log('✅ Nome da instância extraído do campo "instance-Name":', extractedInstanceName)
        } else if (response.instanceName) {
          extractedInstanceName = response.instanceName
          console.log('✅ Nome da instância extraído do campo "instanceName":', extractedInstanceName)
        } else {
          extractedInstanceName = response.code
          console.log('⚠️ Nome da instância não encontrado, usando code como fallback:', extractedInstanceName)
        }
        
        setInstanceName(extractedInstanceName)
        
        console.log('=== DEBUG DOS CAMPOS DE INSTÂNCIA ===')
        console.log('Campo "instance-Name":', response["instance-Name"])
        console.log('Campo "instanceName":', response.instanceName)
        console.log('Nome final extraído:', extractedInstanceName)
        
        // Enviar dados da instância para o webhook APÓS gerar o QR Code
        await sendInstanceData(extractedInstanceName)
        
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
      img.src = qrCodeData.base64
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
    handleConnect,
    handleNewConnection,
    handleImageError,
    handleImageLoad,
    retryQrCode
  }
}
