
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { isValidBase64, QRCodeData, WhatsAppResponse } from "@/utils/whatsappUtils"

interface UseWhatsAppConnectionProps {
  onConnect: () => Promise<WhatsAppResponse>
}

export const useWhatsAppConnection = ({ onConnect }: UseWhatsAppConnectionProps) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null)
  const [connectionResult, setConnectionResult] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionResult(null)
    setQrCodeData(null)
    setImageError(false)

    try {
      const response = await onConnect()
      console.log('=== RESPOSTA COMPLETA DA API ===')
      console.log('Estrutura da resposta:', JSON.stringify(response, null, 2))
      console.log('Tipo da resposta:', typeof response)
      console.log('Keys da resposta:', Object.keys(response || {}))
      
      if (response.code) {
        console.log('Código encontrado:', response.code)
      }
      
      if (response.base64) {
        console.log('Base64 encontrado')
        console.log('Tamanho do base64:', response.base64.length)
        console.log('Primeiros 50 chars:', response.base64.substring(0, 50))
        console.log('Últimos 50 chars:', response.base64.substring(response.base64.length - 50))
        console.log('É base64 válido?', isValidBase64(response.base64))
      }
      
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
      console.error("Tipo do erro:", typeof error)
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
  }

  const handleImageError = () => {
    console.error('=== ERRO AO CARREGAR IMAGEM DO QR CODE ===')
    console.error('Base64 que falhou:', qrCodeData?.base64?.substring(0, 100) + '...')
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
    handleConnect,
    handleNewConnection,
    handleImageError,
    handleImageLoad,
    retryQrCode
  }
}
