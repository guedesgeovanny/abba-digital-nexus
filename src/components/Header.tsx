
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"

export const Header = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    })
  }

  return (
    <header className="bg-abba-black border-b border-abba-gray px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <User className="h-5 w-5 text-abba-green" />
        <span className="text-abba-text text-sm">
          {user?.email}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="text-gray-400 hover:text-abba-green"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sair
      </Button>
    </header>
  )
}
