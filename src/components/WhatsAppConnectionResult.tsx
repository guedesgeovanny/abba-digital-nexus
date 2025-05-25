
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { ProfileData } from "@/utils/whatsappUtils"
import { WhatsAppProfileDisplay } from "./WhatsAppProfileDisplay"

interface WhatsAppConnectionResultProps {
  connectionResult: string
  profileData?: ProfileData | null
  onNewConnection: () => void
  onDeleteConnection?: () => void
  isDeleting?: boolean
}

export const WhatsAppConnectionResult = ({
  connectionResult,
  profileData,
  onNewConnection,
  onDeleteConnection,
  isDeleting = false
}: WhatsAppConnectionResultProps) => {
  // Se temos dados do perfil, mostrar o display do perfil
  if (profileData && onDeleteConnection) {
    return (
      <div className="w-full space-y-3">
        <WhatsAppProfileDisplay 
          profileData={profileData}
          onDeleteConnection={onDeleteConnection}
          isDeleting={isDeleting}
        />
        
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

  // Fallback para resultado simples de conexão
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
