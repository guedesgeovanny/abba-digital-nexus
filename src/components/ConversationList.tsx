
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"
import { Conversation } from "@/hooks/useConversations"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  isLoading?: boolean
}

export const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  isLoading 
}: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Carregando conversas...</div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Nenhuma conversa encontrada</div>
      </div>
    )
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
    } catch {
      return ''
    }
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`
            flex items-center p-3 cursor-pointer hover:bg-abba-gray transition-colors
            ${selectedConversation?.id === conversation.id ? 'bg-abba-gray border-r-2 border-abba-green' : ''}
          `}
        >
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={conversation.contact_avatar || undefined} alt={conversation.contact_name} />
              <AvatarFallback className="bg-abba-gray">
                <User className="h-6 w-6 text-abba-green" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-abba-text truncate">
                {conversation.contact_name}
              </h3>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                {formatTime(conversation.last_message_at)}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-400 truncate">
                {conversation.last_message || 'Nenhuma mensagem'}
              </p>
              {conversation.unread_count > 0 && (
                <Badge className="bg-abba-green text-abba-black ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                  {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
