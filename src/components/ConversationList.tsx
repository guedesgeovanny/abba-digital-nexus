
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Trash2 } from "lucide-react"
import { Conversation } from "@/hooks/useConversations"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  onDeleteConversation?: (conversationId: string) => void
  isLoading?: boolean
}

export const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  onDeleteConversation,
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

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDeleteConversation) {
      onDeleteConversation(conversationId)
    }
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`
            flex items-center p-3 cursor-pointer hover:bg-abba-gray transition-colors group
            ${selectedConversation?.id === conversation.id ? 'bg-abba-gray border-r-2 border-abba-green' : ''}
          `}
        >
          <div className="relative" onClick={() => onSelectConversation(conversation)}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={conversation.contact_avatar || undefined} alt={conversation.contact_name} />
              <AvatarFallback className="bg-abba-gray">
                <User className="h-6 w-6 text-abba-green" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="ml-3 flex-1 min-w-0" onClick={() => onSelectConversation(conversation)}>
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

          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  title="Excluir Conversa"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Conversa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza de que deseja excluir esta conversa com {conversation.contact_name}? 
                    Todas as mensagens também serão excluídas permanentemente. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Excluir Conversa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  )
}
