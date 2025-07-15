import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User, Trash2 } from "lucide-react"
import { Conversation } from "@/hooks/useConversations"
import { useMessages } from "@/hooks/useMessages"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { MediaMessage } from "@/components/MediaMessage"
import { detectFileInMessage } from "@/utils/fileDetection"
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

interface ChatAreaProps {
  conversation: Conversation
  onDeleteConversation: (conversationId: string) => void
  onUpdateAgentStatus: (conversationId: string, newStatus: 'Ativo' | 'Inativo') => void
}

export const ChatArea = ({ conversation, onDeleteConversation, onUpdateAgentStatus }: ChatAreaProps) => {
  const [newMessage, setNewMessage] = useState("")
  const [isUpdatingAgentStatus, setIsUpdatingAgentStatus] = useState(false)
  const { messages, isLoading, sendMessage, isSending, clearMessages, isClearing } = useMessages(conversation.id)
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll para o final quando novas mensagens chegam
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || isSending) return
    
    try {
      await sendMessage({ content: newMessage.trim() })
      setNewMessage("")
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const handleClearMessages = async () => {
    try {
      await clearMessages()
      
      toast({
        title: "Mensagens apagadas",
        description: "Todas as mensagens desta conversa foram apagadas.",
      })
    } catch (error) {
      console.error('Erro ao apagar mensagens:', error)
      toast({
        title: "Erro",
        description: "Erro ao apagar mensagens. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const formatMessageTime = (dateString: string | null) => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
    } catch {
      return ''
    }
  }

  const getChannelIcon = (channel: string | null) => {
    switch (channel) {
      case 'whatsapp':
        return '📱'
      case 'instagram':
        return '📷'
      case 'messenger':
        return '💬'
      default:
        return '💭'
    }
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
      <Badge className={getAccountColor(account)}>{account}</Badge>
    ) : (
      <Badge className="bg-gray-500 text-white">Sem conta</Badge>
    )
  }

  const handleToggleAgentStatus = async () => {
    const newStatus = conversation.status_agent === 'Ativo' ? 'Inativo' : 'Ativo'
    
    setIsUpdatingAgentStatus(true)
    
    try {
      await onUpdateAgentStatus(conversation.id, newStatus)
      
      toast({
        title: "Status atualizado",
        description: `Agente de IA ${newStatus === 'Ativo' ? 'ativado' : 'desativado'} com sucesso.`,
      })
    } catch (error) {
      console.error('Erro ao atualizar status do agente:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do agente. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingAgentStatus(false)
    }
  }

  const renderAgentStatusButton = () => {
    if (!conversation.have_agent) return null

    const isActive = conversation.status_agent === 'Ativo'
    const buttonText = isActive ? 'Ativo' : 'Inativo'
    const buttonClass = isActive 
      ? 'bg-green-500 hover:bg-green-600 text-white' 
      : 'bg-red-500 hover:bg-red-600 text-white'

    const actionText = isActive ? 'desativar' : 'ativar'
    const newStatusText = isActive ? 'Inativo' : 'Ativo'

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className={`px-3 py-1 text-xs ${buttonClass}`}
            size="sm"
            disabled={isUpdatingAgentStatus}
          >
            {isUpdatingAgentStatus ? 'Atualizando...' : buttonText}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive ? 'Desativar' : 'Ativar'} agente de IA
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {actionText} as respostas automáticas do agente de IA para esta conversa? 
              O status será alterado para "{newStatusText}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingAgentStatus}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleAgentStatus}
              disabled={isUpdatingAgentStatus}
            >
              {isUpdatingAgentStatus ? 'Atualizando...' : (isActive ? 'Desativar' : 'Ativar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header da conversa */}
      <div className="flex items-center justify-between p-4 border-b border-abba-gray bg-abba-black">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.contact_avatar || undefined} alt={conversation.contact_name} />
            <AvatarFallback className="bg-abba-gray">
              <User className="h-5 w-5 text-abba-green" />
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-semibold text-abba-text">{conversation.contact_name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{getChannelIcon(conversation.channel)} {conversation.channel || 'Chat'}</span>
              {getAccountBadge(conversation.account)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {renderAgentStatusButton()}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir conversa</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteConversation(conversation.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Área das mensagens */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 bg-abba-black">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-gray-400">Carregando mensagens...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-gray-400">Nenhuma mensagem ainda</div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.numero}
                className={`flex ${message.direcao === 'sent' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.direcao === 'sent'
                      ? 'bg-abba-green text-abba-black'
                      : 'bg-abba-gray text-abba-text'
                  }`}
                >
                  {(() => {
                    const fileInfo = detectFileInMessage(message.mensagem)
                    if (fileInfo) {
                      return (
                        <MediaMessage
                          fileInfo={fileInfo}
                          messageText={message.mensagem}
                          isOutgoing={message.direcao === 'sent'}
                        />
                      )
                    }
                    return <p className="text-sm">{message.mensagem}</p>
                  })()}
                  <p className="text-xs opacity-70 mt-1">
                    {formatMessageTime(message.data_hora)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Campo de entrada de mensagem */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-abba-gray bg-abba-black">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
            disabled={isSending || conversation.status === 'fechada'}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || isSending || conversation.status === 'fechada'}
            className="bg-abba-green text-abba-black hover:bg-abba-green/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {conversation.status === 'fechada' && (
          <p className="text-xs text-gray-400 mt-2">Esta conversa está fechada. Reabra-a para enviar mensagens.</p>
        )}
      </form>
    </div>
  )
}