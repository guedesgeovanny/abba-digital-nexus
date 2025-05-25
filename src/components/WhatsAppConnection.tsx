
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Loader2, QrCode, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WhatsAppConnectionProps {
  onConnect: () => Promise<{ code?: string; base64?: string; message?: string }>
}

interface QRCodeData {
  code: string
  base64: string
}

export const WhatsAppConnection = ({
  onConnect
}: WhatsAppConnectionProps) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null)
  const [connectionResult, setConnectionResult] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const { toast } = useToast()

  const isValidBase64 = (str: string): boolean => {
    try {
      return btoa(atob(str)) === str
    } catch (err) {
      return false
    }
  }

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
    // Force reload by updating the src
    const img = document.querySelector('#qr-code-img') as HTMLImageElement
    if (img && qrCodeData) {
      img.src = `data:image/png;base64,${qrCodeData.base64}`
    }
  }

  return (
    <Card className="bg-abba-gray border-abba-gray">
      <CardHeader>
        <CardTitle className="text-abba-text flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-500" />
          Configuração WhatsApp
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure a conexão com a API Evolution para este agente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrCodeData && !connectionResult && (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              "Conectar WhatsApp"
            )}
          </Button>
        )}

        {qrCodeData && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <QrCode className="h-5 w-5" />
              <span className="font-medium">QR Code gerado</span>
            </div>
            
            <div className="w-full bg-white p-4 rounded-lg flex justify-center items-center min-h-[200px]">
              {!imageError ? (
                <img 
                  id="qr-code-img"
                  src={`data:image/png;base64,${qrCodeData.base64}`}
                  alt="QR Code WhatsApp"
                  className="w-48 h-48 object-contain"
                  style={{ maxWidth: '192px', maxHeight: '192px' }}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              ) : (
                <div className="text-center space-y-3">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <p className="text-red-600 text-sm">
                    Erro ao carregar QR Code
                  </p>
                  <Button
                    onClick={retryQrCode}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-300">
                Escaneie este QR Code com seu WhatsApp
              </p>
              <p className="text-xs text-gray-400">
                Código: {qrCodeData.code}
              </p>
              <p className="text-xs text-gray-500">
                Base64 válido: {isValidBase64(qrCodeData.base64) ? '✅' : '❌'}
              </p>
            </div>
            
            <Button
              onClick={handleNewConnection}
              variant="outline"
              className="w-full text-sm"
            >
              Gerar Novo QR Code
            </Button>
          </div>
        )}

        {connectionResult && (
          <div className="space-y-3">
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-md">
              <p className="text-green-400 text-sm font-medium">
                {connectionResult}
              </p>
            </div>
            
            <Button
              onClick={handleNewConnection}
              variant="outline"
              className="w-full text-sm"
            >
              Conectar Novo WhatsApp
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
