
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface WhatsAppConnectionResultProps {
  connectionResult: string
  onNewConnection: () => void
}

export const WhatsAppConnectionResult = ({
  connectionResult,
  onNewConnection
}: WhatsAppConnectionResultProps) => {
  return (
    <div className="w-full space-y-3">
      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-md text-center">
        <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
        <p className="text-green-400 text-sm font-medium">
          {connectionResult}
        </p>
      </div>
      
      <Button
        onClick={onNewConnection}
        variant="outline"
        className="w-full text-sm"
      >
        Conectar Novo WhatsApp
      </Button>
    </div>
  )
}
