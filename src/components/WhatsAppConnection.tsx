
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Loader2, QrCode } from "lucide-react"
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
  const { toast } = useToast()

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionResult(null)
    setQrCodeData(null)

    try {
      const response = await onConnect()
      
      if (response.code && response.base64) {
        setQrCodeData({
          code: response.code,
          base64: response.base64
        })
        toast({
          title: "QR Code gerado!",
          description: "Escaneie o QR Code com seu WhatsApp para conectar.",
        })
      } else if (response.message) {
        setConnectionResult(response.message)
        toast({
          title: "Conexão realizada!",
          description: "WhatsApp conectado com sucesso.",
        })
      }
    } catch (error) {
      console.error("Erro ao conectar WhatsApp:", error)
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
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <QrCode className="h-5 w-5" />
                <span className="font-medium">QR Code gerado</span>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <img 
                  src={`data:image/png;base64,${qrCodeData.base64}`}
                  alt="QR Code WhatsApp"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-300">
                  Escaneie este QR Code com seu WhatsApp
                </p>
                <p className="text-xs text-gray-400">
                  Código: {qrCodeData.code}
                </p>
              </div>
              
              <Button
                onClick={handleNewConnection}
                variant="outline"
                className="text-sm"
              >
                Gerar Novo QR Code
              </Button>
            </div>
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
