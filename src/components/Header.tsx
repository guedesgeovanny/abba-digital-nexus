
import { User } from "lucide-react"
import { useUserProfile } from "@/hooks/useUserProfile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const Header = () => {
  const { profile, loading } = useUserProfile()

  // Extrair primeiro nome do usuário
  const getFirstName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0]
    }
    if (profile?.email) {
      return profile.email.split('@')[0]
    }
    return 'Usuário'
  }

  if (loading) {
    return (
      <header className="bg-abba-black border-b border-abba-gray px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-abba-gray animate-pulse" />
          <div className="flex flex-col gap-1">
            <div className="w-16 h-4 bg-abba-gray rounded animate-pulse" />
            <div className="w-24 h-3 bg-abba-gray rounded animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-abba-black border-b border-abba-gray px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        {profile?.avatar_url ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url} alt="Foto do perfil" />
            <AvatarFallback className="bg-abba-green text-abba-black font-semibold">
              {getFirstName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 h-8 rounded-full bg-abba-green flex items-center justify-center">
            <span className="text-abba-black font-semibold text-sm">
              {getFirstName().charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-abba-text text-sm font-medium">
            {getFirstName()}
          </span>
          <span className="text-abba-text/70 text-xs">
            {profile?.email}
          </span>
        </div>
      </div>
    </header>
  )
}
