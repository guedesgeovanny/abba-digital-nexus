import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus } from "lucide-react"
import { useUsers } from "@/hooks/useUsers"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface AssignConnectionDialogProps {
  connectionId: string
  connectionName: string
  onAssign: () => void
}

export const AssignConnectionDialog = ({ 
  connectionId, 
  connectionName, 
  onAssign 
}: AssignConnectionDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [open, setOpen] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const { users, loading } = useUsers()
  const { toast } = useToast()

  // Filter only active users
  const activeUsers = users.filter(user => user.status === 'active')

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast({
        title: "Erro",
        description: "Selecione um usuário para atribuir a conexão",
        variant: "destructive"
      })
      return
    }

    try {
      setIsAssigning(true)
      
      console.log('🔧 [AssignConnectionDialog] Assigning connection:', {
        connectionId,
        selectedUserId,
        connectionName
      })
      
      // Update the connection's user_id in the database
      const { data, error } = await supabase
        .from('conexoes')
        .update({ user_id: selectedUserId })
        .eq('id', connectionId)
        .select()

      if (error) {
        console.error('🔧 [AssignConnectionDialog] Database error:', error)
        throw error
      }
      
      console.log('✅ [AssignConnectionDialog] Assignment successful:', data)
      
      const selectedUser = activeUsers.find(u => u.id === selectedUserId)
      toast({
        title: "Sucesso",
        description: `Conexão "${connectionName}" atribuída para ${selectedUser?.full_name || 'usuário selecionado'}`
      })
      
      setOpen(false)
      setSelectedUserId("")
      
      // Use setTimeout to prevent UI freeze and ensure state cleanup
      setTimeout(() => {
        onAssign()
      }, 100)
      
    } catch (error) {
      console.error('❌ [AssignConnectionDialog] Error assigning connection:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atribuir a conexão",
        variant: "destructive"
      })
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div 
          className="flex items-center text-sm cursor-pointer w-full px-2 py-1.5 hover:bg-accent rounded-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Atribuir Conexão
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir Conexão</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione o usuário para atribuir a conexão <strong>{connectionName}</strong>:
          </p>
          
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>Carregando usuários...</SelectItem>
              ) : activeUsers.length === 0 ? (
                <SelectItem value="empty" disabled>Nenhum usuário ativo disponível</SelectItem>
              ) : (
                activeUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex flex-col">
                      <span>{user.full_name || user.email}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedUserId || isAssigning || loading}
          >
            {isAssigning ? "Atribuindo..." : "Atribuir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}