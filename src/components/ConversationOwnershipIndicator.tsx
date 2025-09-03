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
  const assignedUserId = conversation.assigned_to || conversation.user_id
  const { userProfile: assignedUser } = useUserById(!isOwnConversation ? assignedUserId : null)

  if (!isAdmin) return null

  if (isOwnConversation) {
    return (
      <Avatar className="h-4 w-4" title="Sua conversa">
        <AvatarImage src={userProfile?.avatar_url || undefined} alt={userProfile?.full_name || 'Usuário'} />
        <AvatarFallback className="bg-green-100 text-green-800 text-xs">
          {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
    )
  } else if (assignedUser) {
    return (
      <Avatar className="h-4 w-4" title={`Atribuída a ${assignedUser.full_name || 'Usuário'}`}>
        <AvatarImage src={assignedUser.avatar_url || undefined} alt={assignedUser.full_name || 'Usuário'} />
        <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
          {assignedUser.full_name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
    )
  } else {
    return (
      <Badge className="bg-blue-100 text-blue-800 text-xs px-1 py-0" title="Conversa de outro usuário">
        Atribuída
      </Badge>
    )
  }
}