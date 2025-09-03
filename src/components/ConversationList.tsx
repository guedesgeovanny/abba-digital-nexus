import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Trash2, UserPlus } from "lucide-react"
import { Conversation } from "@/hooks/useConversations"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAuth } from "@/contexts/AuthContext"
import { useUserById } from "@/hooks/useUserById"
import { ConversationOwnershipIndicator } from "./ConversationOwnershipIndicator"
import { AssignConversationDialog } from "./AssignConversationDialog"
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
  onCloseConversation?: (conversationId: string) => void
  onAssignConversation?: (conversationId: string, userId: string) => Promise<void>
  onMarkAsRead?: (conversationId: string) => Promise<void>
  isLoading?: boolean
}

export const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  onDeleteConversation,
  onCloseConversation,
  onAssignConversation,
  onMarkAsRead,
  isLoading 
}: ConversationListProps) => {
  const { user, userProfile } = useAuth()
  const isAdmin = userProfile?.role === 'admin'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Carregando conversas...</div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Nenhuma conversa encontrada</div>
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

  const handleToggleConversationStatus = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onCloseConversation) {
      onCloseConversation(conversation.id)
    }
  }

  const handleSelectConversation = async (conversation: Conversation) => {
    // Mark conversation as read if it has unread messages
    if (conversation.unread_count > 0 && onMarkAsRead) {
      await onMarkAsRead(conversation.id)
    }
    onSelectConversation(conversation)
  }

  const getAccountColor = (account: string) => {
    // Paleta de cores para diferenciar contas
    const colors = [
      'bg-green-500 text-white',
      'bg-blue-500 text-white', 
      'bg-purple-500 text-white',
      'bg-orange-500 text-white',
      'bg-pink-500 text-white',
      'bg-teal-500 text-white',
      'bg-indigo-500 text-white',
      'bg-red-500 text-white',
      'bg-yellow-500 text-black',
      'bg-cyan-500 text-black'
    ]
    
    // Gerar hash simples da string da conta
    let hash = 0
    for (let i = 0; i < account.length; i++) {
      hash = account.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    // Usar o hash para selecionar uma cor da paleta
    const colorIndex = Math.abs(hash) % colors.length
    return colors[colorIndex]
  }

  const getAccountBadge = (account: string | null) => {
    return account ? (
      <Badge className={`${getAccountColor(account)} text-xs px-1 py-0`}>
        {account.length > 8 ? `${account.slice(0, 8)}...` : account}
      </Badge>
    ) : null
  }

  // Função para verificar se a conversa pertence ao usuário atual
  const isOwnConversation = (conversation: Conversation) => {
    return conversation.user_id === user?.id
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`
            flex items-center p-3 cursor-pointer hover:bg-muted transition-colors group
            ${selectedConversation?.id === conversation.id ? 'bg-muted border-r-2 border-abba-green' : ''}
          `}
        >
          {(conversation.assigned_to || conversation.user_id) && (
            <div className="relative" onClick={() => handleSelectConversation(conversation)}>
              <Avatar className="h-12 w-12">
                <AvatarImage src={conversation.contact_avatar || undefined} alt={conversation.contact_name} />
                <AvatarFallback className="bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          <div className="ml-3 flex-1 min-w-0" onClick={() => handleSelectConversation(conversation)}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-foreground truncate">
                {conversation.contact_name}
              </h3>
              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                {formatTime(conversation.last_message_at)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 mb-1">
              {getAccountBadge(conversation.account)}
              <ConversationOwnershipIndicator conversation={conversation} />
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-muted-foreground truncate">
                {conversation.last_message || 'Nenhuma mensagem'}
              </p>
              {conversation.unread_count > 0 && (
                <Badge className="bg-abba-green text-abba-black ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                  {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                </Badge>
              )}
            </div>
          </div>

          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
            {/* Botão de Auto-atribuir para usuários não-admin em conversas sem responsável */}
            {!isAdmin && !conversation.assigned_to && !conversation.user_id && onAssignConversation && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-green-500"
                title="Atribuir para mim"
                onClick={(e) => {
                  e.stopPropagation()
                  if (user?.id) {
                    onAssignConversation(conversation.id, user.id)
                  }
                }}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            )}
            
            {/* Botão de Atribuir Conversa (apenas para admins) */}
            {isAdmin && onAssignConversation && (
              <AssignConversationDialog
                conversationId={conversation.id}
                conversationContactName={conversation.contact_name}
                onAssign={onAssignConversation}
              />
            )}
            
            {/* Botão de Fechar/Abrir Conversa */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-500"
                  title={conversation.status === 'aberta' ? 'Fechar Conversa' : 'Abrir Conversa'}
                  onClick={(e) => e.stopPropagation()}
                >
                  {conversation.status === 'aberta' ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8m-8 0V8a4 4 0 118 0v4m-8 0v4a4 4 0 108 0v-4" />
                    </svg>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {conversation.status === 'aberta' ? 'Fechar Conversa' : 'Abrir Conversa'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {conversation.status === 'aberta' 
                      ? `Tem certeza de que deseja fechar a conversa com ${conversation.contact_name}?`
                      : `Tem certeza de que deseja reabrir a conversa com ${conversation.contact_name}?`
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={(e) => handleToggleConversationStatus(conversation, e)}
                    className={conversation.status === 'aberta' ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"}
                  >
                    {conversation.status === 'aberta' ? 'Fechar Conversa' : 'Abrir Conversa'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Botão de Excluir */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
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
