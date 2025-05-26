
import { WhatsAppProfileDisplay } from "./WhatsAppProfileDisplay"
import { WhatsAppConnectionSuccess } from "./WhatsAppConnectionSuccess"
import { ProfileData } from "@/utils/whatsappUtils"

interface WhatsAppConnectionResultProps {
  connectionResult: string
  profileData: ProfileData | null
  onNewConnection: () => void
  onDeleteConnection: () => void
  isDeleting?: boolean
  instanceName?: string
}

export const WhatsAppConnectionResult = ({ 
  connectionResult, 
  profileData, 
  onNewConnection, 
  onDeleteConnection,
  isDeleting = false,
  instanceName 
}: WhatsAppConnectionResultProps) => {
  if (profileData) {
    return (
      <WhatsAppProfileDisplay 
        profileData={profileData} 
        onDeleteConnection={onDeleteConnection}
        isDeleting={isDeleting}
        instanceName={instanceName}
      />
    )
  }

  return (
    <WhatsAppConnectionSuccess 
      onNewConnection={onNewConnection}
    />
  )
}
