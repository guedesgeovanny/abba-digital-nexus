
import { CheckCircle, User, Phone } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface ProfileData {
  profilePictureUrl: string
  owner: string
  profileName: string
}

interface WhatsAppProfileDisplayProps {
  profileData: ProfileData
}

export const WhatsAppProfileDisplay = ({ profileData }: WhatsAppProfileDisplayProps) => {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center space-y-4">
        {/* Ícone de sucesso */}
        <div className="flex justify-center">
          <CheckCircle className="h-8 w-8 text-green-400 animate-scale-in" />
        </div>
        
        {/* Avatar do perfil */}
        <div className="flex justify-center">
          <Avatar className="h-16 w-16 border-2 border-green-400">
            <AvatarImage src={profileData.profilePictureUrl} alt="Foto do perfil" />
            <AvatarFallback className="bg-green-100 text-green-800">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Informações do perfil */}
        <div className="space-y-2">
          <h3 className="text-green-400 font-semibold text-lg animate-fade-in">
            WhatsApp Conectado!
          </h3>
          
          {profileData.profileName && (
            <p className="text-green-300 text-sm font-medium">
              {profileData.profileName}
            </p>
          )}
          
          {profileData.owner && (
            <div className="flex items-center justify-center gap-1 text-green-200 text-sm">
              <Phone className="h-3 w-3" />
              <span>{profileData.owner}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
