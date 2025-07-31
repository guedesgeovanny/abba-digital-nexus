
import { Home, Bot, BarChart3, Settings, Users, Contact, Trello, LogOut, MessageSquare } from "lucide-react"
import { useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

// Menu items
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Agentes",
    url: "/agents",
    icon: Bot,
  },
  {
    title: "Contatos",
    url: "/contacts",
    icon: Contact,
  },
  {
    title: "CRM",
    url: "/crm",
    icon: Trello,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { signOut, userProfile, loading } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      console.log("Logout realizado com sucesso")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const getFirstName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ')[0]
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0]
    }
    return 'Usuário'
  }

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/fb0eee38-84d5-47c6-b95f-cb80e02e53d3.png" 
            alt="Abba Digital" 
            className="w-8 h-8"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">Abba Digital</span>
            <span className="text-xs text-muted-foreground">Manager</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`
                      data-[active=true]:bg-abba-green data-[active=true]:text-white
                      hover:bg-muted hover:text-abba-green transition-all duration-200
                      ${location.pathname === item.url ? 'bg-abba-green text-white' : 'text-foreground'}
                    `}
                  >
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border p-4 space-y-3">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
            <div className="flex flex-col gap-1">
              <div className="w-16 h-3 bg-muted rounded animate-pulse"></div>
              <div className="w-24 h-2 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-abba-green rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {getFirstName().charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{getFirstName()}</span>
              <span className="text-xs text-muted-foreground">{userProfile?.email}</span>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
