
import { Home, Bot, BarChart3, Settings, Users, Contact, Trello, LogOut } from "lucide-react"
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
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const location = useLocation()

  const handleLogout = () => {
    // Aqui você implementará a lógica de logout posteriormente
    console.log("Logout realizado")
    window.location.href = "/login"
  }

  return (
    <Sidebar className="border-r border-abba-gray bg-abba-black">
      <SidebarHeader className="border-b border-abba-gray p-4">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/fb0eee38-84d5-47c6-b95f-cb80e02e53d3.png" 
            alt="Abba Digital" 
            className="w-8 h-8"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-abba-text text-sm">Abba Digital</span>
            <span className="text-xs text-gray-400">Manager</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-abba-black">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`
                      data-[active=true]:bg-abba-green data-[active=true]:text-abba-black
                      hover:bg-abba-gray hover:text-abba-green transition-all duration-200
                      ${location.pathname === item.url ? 'bg-abba-green text-abba-black' : 'text-abba-text'}
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
      
      <SidebarFooter className="border-t border-abba-gray p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-abba-green rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-abba-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-abba-text">Admin</span>
            <span className="text-xs text-gray-400">admin@abba.digital</span>
          </div>
        </div>
        
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
