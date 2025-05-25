
import { Clock } from "lucide-react"

interface WhatsAppQRCodeTimerProps {
  timeLeft: number
  isExpired: boolean
  formattedTime: string
}

export const WhatsAppQRCodeTimer = ({ 
  timeLeft, 
  isExpired, 
  formattedTime 
}: WhatsAppQRCodeTimerProps) => {
  if (isExpired) {
    return (
      <div className="flex items-center gap-1 text-orange-400">
        <Clock className="h-3 w-3" />
        <span className="text-xs font-medium">Código Expirado</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-gray-400">
      <Clock className="h-3 w-3" />
      <span className="text-xs">
        Expira em {formattedTime}
      </span>
      <div 
        className="w-12 h-1 bg-gray-600 rounded-full overflow-hidden"
        title={`${timeLeft} segundos restantes`}
      >
        <div 
          className="h-full bg-green-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / 60) * 100}%` }}
        />
      </div>
    </div>
  )
}
