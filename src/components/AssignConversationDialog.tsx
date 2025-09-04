import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus } from "lucide-react"
import { useUsers } from "@/hooks/useUsers"
import { useToast } from "@/hooks/use-toast"

interface AssignConversationDialogProps {
  conversationId: string
  conversationContactName: string
  onAssign: (conversationId: string, userId: string | null) => Promise<void>
}

export const AssignConversationDialog = ({ 
  conversationId, 
  conversationContactName, 
  onAssign 
}: AssignConversationDialogProps) => {
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
        description: "Selecione uma opção para atribuir a conversa",
        variant: "destructive"
      })
      return
    }

    try {
      setIsAssigning(true)
      const userIdToAssign = selectedUserId === "unassign" ? null : selectedUserId
      await onAssign(conversationId, userIdToAssign)
      
      if (selectedUserId === "unassign") {
        toast({
          title: "Sucesso",
          description: `Conversa com ${conversationContactName} removida de qualquer responsável`
        })
      } else {
        const selectedUser = activeUsers.find(u => u.id === selectedUserId)
        toast({
          title: "Sucesso",
          description: `Conversa com ${conversationContactName} atribuída para ${selectedUser?.full_name || 'usuário selecionado'}`
        })
      }
      
      setOpen(false)
      setSelectedUserId("")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atribuir a conversa",
        variant: "destructive"
      })
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500"
          title="Atribuir Conversa"
          onClick={(e) => e.stopPropagation()}
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir Conversa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione o usuário para atribuir a conversa com <strong>{conversationContactName}</strong>:
          </p>
          
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>Carregando usuários...</SelectItem>
              ) : (
                <>
                  <SelectItem value="unassign">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Sem responsável</span>
                      <span className="text-xs text-muted-foreground">Deixar conversa sem atribuição</span>
                    </div>
                  </SelectItem>
                  {activeUsers.length === 0 ? (
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
                </>
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