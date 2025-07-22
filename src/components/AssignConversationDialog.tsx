
import { useState } from 'react'
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

interface AssignConversationDialogProps {
  conversationId: string
  currentAssignedUserId?: string | null
  contactName: string
  onAssign: (conversationId: string, userId: string | null) => Promise<void>
  children?: React.ReactNode
}

export const AssignConversationDialog = ({
  conversationId,
  currentAssignedUserId,
  contactName,
  onAssign,
  children
}: AssignConversationDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(currentAssignedUserId || null)
  const [isOpen, setIsOpen] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const { users, loading: usersLoading } = useUsers()
  const { toast } = useToast()

  // Filtrar apenas usuários ativos
  const activeUsers = users.filter(user => user.status === 'active')

  const handleAssign = async () => {
    try {
      setIsAssigning(true)
      await onAssign(conversationId, selectedUserId)
      
      toast({
        title: 'Conversa atribuída',
        description: selectedUserId 
          ? `Conversa com ${contactName} foi atribuída com sucesso`
          : `Atribuição da conversa com ${contactName} foi removida`,
      })
      
      setIsOpen(false)
    } catch (error) {
      console.error('Erro ao atribuir conversa:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atribuir a conversa',
        variant: 'destructive',
      })
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500"
            title="Atribuir Conversa"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atribuir Conversa</DialogTitle>
          <DialogDescription>
            Atribuir a conversa com <strong>{contactName}</strong> para um usuário.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Usuário</label>
            <Select
              value={selectedUserId || ''}
              onValueChange={(value) => setSelectedUserId(value === '' ? null : value)}
              disabled={usersLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum usuário (remover atribuição)</SelectItem>
                {activeUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={isAssigning || usersLoading}
          >
            {isAssigning ? 'Atribuindo...' : 'Atribuir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
