
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { QRCodeData } from "@/utils/whatsappUtils"
import { isValidBase64 } from "@/utils/whatsappUtils"

interface WhatsAppQRCodeProps {
  qrCodeData: QRCodeData
  imageError: boolean
  onImageError: () => void
  onImageLoad: () => void
  onRetryQrCode: () => void
  onNewConnection: () => void
}

export const WhatsAppQRCode = ({
  qrCodeData,
  imageError,
  onImageError,
  onImageLoad,
  onRetryQrCode,
  onNewConnection
}: WhatsAppQRCodeProps) => {
  return (
    <div className="w-full flex flex-col items-center space-y-3">
      <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
        {!imageError ? (
          <img 
            id="qr-code-img"
            src={`data:image/png;base64,${qrCodeData.base64}`}
            alt="QR Code WhatsApp"
            className="w-40 h-40 object-contain"
            onError={onImageError}
            onLoad={onImageLoad}
          />
        ) : (
          <div className="w-40 h-40 flex flex-col items-center justify-center text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-red-600 text-xs">
              Erro ao carregar QR Code
            </p>
            <Button
              onClick={onRetryQrCode}
              variant="outline"
              size="sm"
              className="text-xs px-2 py-1 h-6"
            >
              Tentar Novamente
            </Button>
          </div>
        )}
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-sm text-gray-300 font-medium">
          Escaneie com seu WhatsApp
        </p>
        <p className="text-xs text-gray-400">
          Código: {qrCodeData.code}
        </p>
        <div className="flex items-center justify-center gap-1">
          <span className="text-xs text-gray-500">Status:</span>
          {isValidBase64(qrCodeData.base64) ? (
            <span className="text-xs text-green-400">✅ Válido</span>
          ) : (
            <span className="text-xs text-red-400">❌ Inválido</span>
          )}
        </div>
      </div>
      
      <Button
        onClick={onNewConnection}
        variant="outline"
        size="sm"
        className="text-sm"
      >
        Gerar Novo QR Code
      </Button>
    </div>
  )
}
