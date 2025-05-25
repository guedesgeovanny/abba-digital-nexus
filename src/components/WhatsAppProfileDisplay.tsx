
import { CheckCircle, User, Phone, Trash2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProfileData {
  profilePictureUrl: string
  contact: string
  profileName: string
}

interface WhatsAppProfileDisplayProps {
  profileData: ProfileData
  onDeleteConnection: () => void
  isDeleting?: boolean
}

export const WhatsAppProfileDisplay = ({ 
  profileData, 
  onDeleteConnection,
  isDeleting = false 
}: WhatsAppProfileDisplayProps) => {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center space-y-4 relative">
        {/* Botão de deletar no canto superior direito */}
        <div className="absolute top-3 right-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Desconectar WhatsApp</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja desconectar este WhatsApp? Você precisará 
                  escanear um novo QR Code para reconectar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteConnection}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Desconectando..." : "Desconectar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
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
          
          {profileData.contact && (
            <div className="flex items-center justify-center gap-1 text-green-200 text-sm">
              <Phone className="h-3 w-3" />
              <span>{profileData.contact}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
