
import { CheckCircle, Zap } from "lucide-react"

interface WhatsAppConnectionSuccessProps {
  instanceName?: string
}

export const WhatsAppConnectionSuccess = ({ instanceName }: WhatsAppConnectionSuccessProps) => {
  return (
    <div className="w-40 h-40 flex flex-col items-center justify-center bg-green-900/20 border border-green-500/30 rounded-lg relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse"></div>
      
      {/* Success icon with animation */}
      <div className="relative z-10 flex flex-col items-center space-y-3">
        <div className="relative">
          <CheckCircle className="h-12 w-12 text-green-400 animate-scale-in" />
          <Zap className="h-6 w-6 text-green-300 absolute -top-1 -right-1 animate-bounce" />
        </div>
        
        <div className="text-center">
          <p className="text-green-400 text-sm font-semibold animate-fade-in">
            Conectado!
          </p>
          {instanceName && (
            <p className="text-green-300 text-xs opacity-75">
              {instanceName}
            </p>
          )}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
      <div className="absolute bottom-2 right-2 w-1 h-1 bg-green-300 rounded-full animate-ping animation-delay-500"></div>
    </div>
  )
}
