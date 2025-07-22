import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus } from "lucide-react"
import { useUsers } from "@/hooks/useUsers"
import { useToast } from "@/hooks/use-toast"
import { Conversation } from "@/hooks/useConversations"

interface AssignConversationDialogProps {
  conversation: Conversation
  onAssign: (conversationId: string, userId: string | null) => Promise<void>
}

export const AssignConversationDialog = ({ conversation, onAssign }: AssignConversationDialogProps) => {
  const [open, setOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(conversation.assigned_to)
  const [isAssigning, setIsAssigning] = useState(false)
  const { users, loading } = useUsers()
  const { toast } = useToast()

  // Filtrar apenas usuários ativos
  const activeUsers = users.filter(user => user.status === 'active')

  const handleAssign = async () => {
    try {
      setIsAssigning(true)
      await onAssign(conversation.id, selectedUserId)
      
      toast({
        title: "Sucesso",
        description: selectedUserId 
          ? `Conversa atribuída com sucesso`
          : "Conversa removida de atribuição",
      })
      
      setOpen(false)
    } catch (error) {
      console.error('Erro ao atribuir conversa:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atribuir a conversa",
        variant: "destructive"
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setSelectedUserId(conversation.assigned_to)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-green-500"
          title="Atribuir Conversa"
          onClick={(e) => e.stopPropagation()}
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atribuir Conversa</DialogTitle>
          <DialogDescription>
            Atribuir a conversa com {conversation.contact_name} para um usuário responsável.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Usuário Responsável</label>
            <Select
              value={selectedUserId || "none"}
              onValueChange={(value) => setSelectedUserId(value === "none" ? null : value)}
              disabled={loading || isAssigning}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem atribuição</SelectItem>
                {activeUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <span>{user.full_name || user.email}</span>
                      <span className="text-xs text-muted-foreground">
                        ({user.role})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {conversation.assigned_user && (
            <div className="text-sm text-muted-foreground">
              Atualmente atribuída para: {conversation.assigned_user.full_name || conversation.assigned_user.email}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isAssigning}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={isAssigning || loading}>
            {isAssigning ? "Atribuindo..." : "Atribuir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}