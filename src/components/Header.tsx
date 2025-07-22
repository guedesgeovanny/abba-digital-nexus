
import { User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const Header = () => {
  const { userProfile, loading } = useAuth()

  // Extrair primeiro nome do usuário
  const getFirstName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ')[0]
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0]
    }
    return 'Usuário'
  }

  console.log('Header - Profile:', userProfile)
  console.log('Header - Loading:', loading)

  if (loading) {
    return (
      <header className="bg-abba-black border-b border-abba-gray px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-abba-gray animate-pulse" />
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
        <div className="w-8 h-8 rounded-full bg-abba-green flex items-center justify-center">
          <span className="text-abba-black font-semibold text-sm">
            {getFirstName().charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-abba-text text-sm font-medium">
            {getFirstName()}
          </span>
          <span className="text-abba-text/70 text-xs">
            {userProfile?.email}
          </span>
        </div>
      </div>
    </header>
  )
}
