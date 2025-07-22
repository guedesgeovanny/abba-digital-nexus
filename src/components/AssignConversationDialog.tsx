
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Conversation } from '@/hooks/useConversations'

interface User {
  id: string
  full_name: string | null
  email: string
  role: string
}

interface AssignConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversation: Conversation | null
  onAssign: (conversationId: string, userId: string | null) => Promise<void>
}

export const AssignConversationDialog = ({
  open,
  onOpenChange,
  conversation,
  onAssign
}: AssignConversationDialogProps) => {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchUsers()
      setSelectedUserId(conversation?.assigned_to || '')
    }
  }, [open, conversation])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, status')
        .in('role', ['admin', 'editor'])
        .eq('status', 'active')
        .order('full_name')

      if (error) throw error

      const validUsers = (data || [])
        .filter(user => user.full_name && user.full_name.trim() !== '')
        .map(user => ({
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role
        }))

      setUsers(validUsers)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive'
      })
    }
  }

  const handleAssign = async () => {
    if (!conversation) return

    try {
      setLoading(true)
      await onAssign(conversation.id, selectedUserId || null)
      
      toast({
        title: 'Sucesso',
        description: selectedUserId 
          ? 'Conversa atribuída com sucesso' 
          : 'Atribuição removida com sucesso'
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao atribuir conversa:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atribuir a conversa',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atribuir Conversa</DialogTitle>
          <DialogDescription>
            Atribua esta conversa a um usuário responsável ou remova a atribuição.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="user-select" className="text-sm font-medium">
              Usuário Responsável
            </label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem atribuição</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={loading}>
            {loading ? 'Atribuindo...' : 'Atribuir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
