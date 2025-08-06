import { User, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
export const Header = () => {
  const {
    userProfile,
    loading
  } = useAuth();

  // Extrair primeiro nome do usuário
  const getFirstName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ')[0];
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0];
    }
    return 'Usuário';
  };
  console.log('Header - Profile:', userProfile);
  console.log('Header - Loading:', loading);
  if (loading) {
    return <header className="bg-background border-b border-border px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          <div className="flex flex-col gap-1">
            <div className="w-16 h-4 bg-muted rounded animate-pulse" />
            <div className="w-24 h-3 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </header>;
  }
  return <header className="bg-background border-b border-border px-6 py-3 flex justify-between items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-abba-green hover:bg-accent">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          
          <div className="flex flex-col">
            
            
          </div>
        </div>
        
        {/* Profile Edit Button */}
        <ProfileEditDialog trigger={<Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">
              <User className="h-4 w-4" />
            </Button>} />
      </div>
    </header>;
};