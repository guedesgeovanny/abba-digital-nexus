import { Home, Bot, Headphones, BarChart3, Settings, Users, Contact, Trello, LogOut, MessageSquare } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Menu items
const items = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: Home
}, {
  title: "Conexões",
  url: "/agents",
  icon: Bot
}, {
  title: "Contatos",
  url: "/contacts",
  icon: Contact
}, {
  title: "CRM",
  url: "/crm",
  icon: Trello
}, {
  title: "Chat",
  url: "/chat",
  icon: MessageSquare
}, {
  title: "Configurações",
  url: "/settings",
  icon: Settings
}];

export function AppSidebar() {
  const location = useLocation();
  const { signOut, userProfile, loading } = useAuth();
  const { state } = useSidebar();
  
  const handleLogout = async () => {
    try {
      await signOut();
      console.log("Logout realizado com sucesso");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
  
  const getFirstName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ')[0];
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0];
    }
    return 'Usuário';
  };
  
  const isCollapsed = state === "collapsed";
  
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-sidebar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center relative">
            <img 
              src="/lovable-uploads/ac4a1d02-c454-4a67-b422-71008557e1d9.png" 
              alt="Marcas & Patentes" 
              className="w-full h-full object-cover"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sidebar-foreground text-sm truncate">Marcas & Patentes</span>
              <span className="text-xs text-sidebar-accent-foreground truncate">Brasil</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-sidebar-accent-foreground text-xs uppercase tracking-wider">
              Menu Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={isCollapsed ? item.title : undefined}
                    className={cn(
                      "data-[active=true]:bg-abba-green data-[active=true]:text-white hover:bg-sidebar-accent hover:text-abba-green transition-all duration-200",
                      location.pathname === item.url ? 'bg-abba-green text-white' : 'text-sidebar-foreground'
                    )}
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4 space-y-3 bg-sidebar">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sidebar-accent rounded-full animate-pulse flex-shrink-0"></div>
            {!isCollapsed && (
              <div className="flex flex-col gap-1 min-w-0">
                <div className="w-16 h-3 bg-sidebar-accent rounded animate-pulse"></div>
                <div className="w-24 h-2 bg-sidebar-accent rounded animate-pulse"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center relative">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt={getFirstName()} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-abba-green rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {getFirstName().charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-sidebar-foreground truncate">{getFirstName()}</span>
                <span className="text-xs text-sidebar-accent-foreground truncate">{userProfile?.email}</span>
              </div>
            )}
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size={isCollapsed ? "icon" : "sm"} 
          onClick={handleLogout} 
          className={cn(
            "text-red-400 hover:text-red-300 hover:bg-red-400/10",
            isCollapsed ? "w-8 h-8 p-0" : "w-full justify-start"
          )}
          title={isCollapsed ? "Sair" : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}