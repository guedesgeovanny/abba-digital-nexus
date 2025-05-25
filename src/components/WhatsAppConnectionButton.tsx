
import { Button } from "@/components/ui/button"
import { MessageSquare, Loader2, QrCode, CheckCircle } from "lucide-react"
import { QRCodeData, ProfileData } from "@/utils/whatsappUtils"

interface WhatsAppConnectionButtonProps {
  isConnecting: boolean
  qrCodeData: QRCodeData | null
  connectionResult: string | null
  profileData?: ProfileData | null
  onConnect: () => void
}

export const WhatsAppConnectionButton = ({
  isConnecting,
  qrCodeData,
  connectionResult,
  profileData,
  onConnect
}: WhatsAppConnectionButtonProps) => {
  return (
    <Button
      onClick={onConnect}
      disabled={isConnecting || !!qrCodeData || !!connectionResult || !!profileData}
      className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600"
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Conectando...
        </>
      ) : qrCodeData ? (
        <>
          <QrCode className="mr-2 h-4 w-4" />
          QR Code Gerado
        </>
      ) : connectionResult || profileData ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          WhatsApp Conectado
        </>
      ) : (
        "Conectar WhatsApp"
      )}
    </Button>
  )
}
