import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOptimizedUsers } from "@/hooks/useOptimizedUsers"
import { SkeletonUserList, ErrorState } from "@/components/LoadingStates"

interface UserFilterProps {
  selectedUser: string
  onUserChange: (user: string) => void
}

export const UserFilter = ({ selectedUser, onUserChange }: UserFilterProps) => {
  const { users, loading, error, refetch } = useOptimizedUsers()

  if (loading) {
    return (
      <div className="w-40">
        <Select disabled>
          <SelectTrigger className="bg-background border-border text-foreground">
            <SelectValue placeholder="Carregando..." />
          </SelectTrigger>
        </Select>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-40">
        <Select disabled>
          <SelectTrigger className="bg-background border-border text-foreground border-destructive">
            <SelectValue placeholder="Erro ao carregar" />
          </SelectTrigger>
        </Select>
      </div>
    )
  }

  return (
    <div className="w-40">
      <Select value={selectedUser} onValueChange={onUserChange}>
        <SelectTrigger className="bg-background border-border text-foreground focus:border-abba-green">
          <SelectValue placeholder="Todos os usuários" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value="all" className="text-foreground focus:bg-abba-green focus:text-abba-black">
            Todos os usuários
          </SelectItem>
          {users.map((user) => (
            <SelectItem 
              key={user.id} 
              value={user.id}
              className="text-foreground focus:bg-abba-green focus:text-abba-black"
            >
              {user.full_name || user.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}