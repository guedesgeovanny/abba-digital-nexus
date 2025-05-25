
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection"
import { WhatsAppConnectionButton } from "./WhatsAppConnectionButton"
import { WhatsAppQRCode } from "./WhatsAppQRCode"
import { WhatsAppConnectionResult } from "./WhatsAppConnectionResult"
import { WhatsAppResponse } from "@/utils/whatsappUtils"

interface WhatsAppConnectionProps {
  onConnect: () => Promise<WhatsAppResponse>
}

export const WhatsAppConnection = ({ onConnect }: WhatsAppConnectionProps) => {
  const {
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
  } = useWhatsAppConnection({ onConnect })

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
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <WhatsAppConnectionButton
            isConnecting={isConnecting}
            qrCodeData={qrCodeData}
            connectionResult={connectionResult}
            onConnect={handleConnect}
          />

          {qrCodeData && (
            <WhatsAppQRCode
              qrCodeData={qrCodeData}
              imageError={imageError}
              isExpired={isExpired}
              timeLeft={timeLeft}
              formattedTime={formattedTime}
              instanceName={instanceName}
              onImageError={handleImageError}
              onImageLoad={handleImageLoad}
              onRetryQrCode={retryQrCode}
              onNewConnection={handleNewConnection}
            />
          )}

          {connectionResult && (
            <WhatsAppConnectionResult
              connectionResult={connectionResult}
              onNewConnection={handleNewConnection}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
