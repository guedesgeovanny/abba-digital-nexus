
import { User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export const Header = () => {
  const { user } = useAuth()

  // Extrair primeiro nome do usuário
  const getFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0]
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'Usuário'
  }

  return (
    <header className="bg-abba-black border-b border-abba-gray px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <User className="h-5 w-5 text-abba-green" />
        <div className="flex flex-col">
          <span className="text-abba-text text-sm font-medium">
            {getFirstName()}
          </span>
          <span className="text-abba-text/70 text-xs">
            {user?.email}
          </span>
        </div>
      </div>
    </header>
  )
}
