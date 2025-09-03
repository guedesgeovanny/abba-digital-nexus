import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useUserById } from "@/hooks/useUserById"
import { Conversation } from "@/hooks/useConversations"

interface ConversationOwnershipIndicatorProps {
  conversation: Conversation
}

export const ConversationOwnershipIndicator = ({ conversation }: ConversationOwnershipIndicatorProps) => {
  const { user, userProfile } = useAuth()
  const isAdmin = userProfile?.role === 'admin'
  
  // Buscar dados do usuário atribuído se não for a conversa do próprio usuário
  const isOwnConversation = conversation.user_id === user?.id
  const hasAssignedUser = conversation.assigned_to !== null && conversation.assigned_to !== undefined
  const { userProfile: assignedUser } = useUserById(conversation.assigned_to || null)

  if (!isAdmin) return null

  // Se for conversa própria, mostrar avatar próprio
  if (isOwnConversation) {
    return (
      <Avatar className="h-4 w-4" title="Sua conversa">
        <AvatarImage src={userProfile?.avatar_url || undefined} alt={userProfile?.full_name || 'Usuário'} />
        <AvatarFallback className="bg-green-100 text-green-800 text-xs">
          {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
    )
  }
  
  // Se há usuário atribuído, mostrar avatar do usuário atribuído
  if (hasAssignedUser && assignedUser) {
    return (
      <Avatar className="h-4 w-4" title={`Atribuída a ${assignedUser.full_name || 'Usuário'}`}>
        <AvatarImage src={assignedUser.avatar_url || undefined} alt={assignedUser.full_name || 'Usuário'} />
        <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
          {assignedUser.full_name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
    )
  }
  
  // Se não há responsável atribuído, não mostrar nada
  return null
}