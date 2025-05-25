
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { QRCodeData } from "@/utils/whatsappUtils"
import { isValidBase64 } from "@/utils/whatsappUtils"
import { WhatsAppQRCodeTimer } from "./WhatsAppQRCodeTimer"
import { WhatsAppConnectionSuccess } from "./WhatsAppConnectionSuccess"

interface WhatsAppQRCodeProps {
  qrCodeData: QRCodeData
  imageError: boolean
  isExpired: boolean
  timeLeft: number
  formattedTime: string
  connectionStatus: 'checking' | 'connected' | 'disconnected'
  instanceName?: string
  onImageError: () => void
  onImageLoad: () => void
  onRetryQrCode: () => void
  onNewConnection: () => void
}

export const WhatsAppQRCode = ({
  qrCodeData,
  imageError,
  isExpired,
  timeLeft,
  formattedTime,
  connectionStatus,
  instanceName,
  onImageError,
  onImageLoad,
  onRetryQrCode,
  onNewConnection
}: WhatsAppQRCodeProps) => {
  // Se conectado, mostrar animação de sucesso
  if (connectionStatus === 'connected') {
    return (
      <div className="w-full flex flex-col items-center space-y-3">
        <WhatsAppConnectionSuccess instanceName={instanceName} />
        
        <div className="text-center">
          <p className="text-sm text-green-400 font-medium">
            WhatsApp Conectado!
          </p>
          <p className="text-xs text-gray-400">
            Conexão estabelecida com sucesso
          </p>
        </div>
        
        <Button
          onClick={onNewConnection}
          variant="outline"
          size="sm"
          className="text-sm"
        >
          Conectar Novo WhatsApp
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center space-y-3">
      <div className="bg-white p-3 rounded-lg border-2 border-gray-200 relative">
        {!imageError && !isExpired ? (
          <img 
            id="qr-code-img"
            src={`data:image/png;base64,${qrCodeData.base64}`}
            alt="QR Code WhatsApp"
            className={`w-40 h-40 object-contain ${isExpired ? 'opacity-50 grayscale' : ''}`}
            onError={onImageError}
            onLoad={onImageLoad}
          />
        ) : (
          <div className="w-40 h-40 flex flex-col items-center justify-center text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-red-600 text-xs">
              {isExpired ? 'QR Code Expirado' : 'Erro ao carregar QR Code'}
            </p>
            {!isExpired && (
              <Button
                onClick={onRetryQrCode}
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 h-6"
              >
                Tentar Novamente
              </Button>
            )}
          </div>
        )}
        
        {/* Overlay quando expirado */}
        {isExpired && !imageError && (
          <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
            <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
              Expirado
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-300 font-medium">
          Escaneie com seu WhatsApp
        </p>
        
        {/* Timer do QR Code */}
        <WhatsAppQRCodeTimer 
          timeLeft={timeLeft}
          isExpired={isExpired}
          formattedTime={formattedTime}
        />
        
        {/* Status de validação do base64 - removido conforme solicitado */}
        {/* <div className="flex items-center justify-center gap-1">
          <span className="text-xs text-gray-500">Status:</span>
          {isValidBase64(qrCodeData.base64) ? (
            <span className="text-xs text-green-400">✅ Válido</span>
          ) : (
            <span className="text-xs text-red-400">❌ Inválido</span>
          )}
        </div> */}
      </div>
      
      <Button
        onClick={onNewConnection}
        variant="outline"
        size="sm"
        className="text-sm"
        disabled={connectionStatus === 'checking'}
      >
        {isExpired ? 'Gerar Novo QR Code' : 'Cancelar'}
      </Button>
    </div>
  )
}
