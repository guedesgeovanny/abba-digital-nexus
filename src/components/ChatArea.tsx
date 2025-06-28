
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Smile, Mic, User, Bot, Trash2, X } from "lucide-react"
import { useState } from "react"
import { Conversation } from "@/hooks/useConversations"
import { useMessages } from "@/hooks/useMessages"
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
  onDeleteConversation?: (conversationId: string) => void
  onCloseConversation?: (conversationId: string) => void
}

export const ChatArea = ({ conversation, onDeleteConversation, onCloseConversation }: ChatAreaProps) => {
  const [isAiAgentActive, setIsAiAgentActive] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const { messages, isLoading, sendMessage, isSending, clearMessages, isClearing } = useMessages(conversation.id)

  const handleToggleAiAgent = () => {
    setIsAiAgentActive(!isAiAgentActive)
    console.log(`AI Agent ${!isAiAgentActive ? 'ativado' : 'desativado'} para a conversa ${conversation.id}`)
  }

  const handleDeleteConversation = () => {
    if (onDeleteConversation) {
      onDeleteConversation(conversation.id)
    }
    console.log(`Excluindo conversa ${conversation.id}`)
  }

  const handleCloseConversation = () => {
    if (onCloseConversation) {
      onCloseConversation(conversation.id)
    }
    console.log(`Fechando conversa ${conversation.id}`)
  }

  const handleClearMessages = () => {
    clearMessages()
    console.log(`Limpando mensagens da conversa ${conversation.id}`)
  }

  const handleSendMessage = () => {
    if (messageInput.trim() && !isSending) {
      sendMessage({ content: messageInput.trim() })
      setMessageInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header do chat */}
      <div className="flex items-center justify-between p-4 border-b border-abba-gray bg-abba-black">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.contact_avatar || undefined} alt={conversation.contact_name} />
            <AvatarFallback className="bg-abba-gray">
              <User className="h-5 w-5 text-abba-green" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium text-abba-text">
              {conversation.contact_name}
            </h3>
            <p className="text-xs text-gray-400">
              {conversation.contact_username}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToggleAiAgent}
            className={`${isAiAgentActive 
              ? 'text-abba-green hover:text-abba-green/80' 
              : 'text-gray-400 hover:text-abba-green'
            }`}
            title={isAiAgentActive ? 'Desativar Agente IA' : 'Ativar Agente IA'}
          >
            <Bot className="h-4 w-4" />
          </Button>

          {conversation.status === 'aberta' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-yellow-500"
                  title="Fechar Conversa"
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Fechar Conversa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza de que deseja fechar esta conversa? Você poderá reabri-la a qualquer momento.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCloseConversation}>
                    Fechar Conversa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-orange-500"
                title="Limpar Mensagens"
                disabled={isClearing}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar Mensagens</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza de que deseja apagar todas as mensagens desta conversa? 
                  Esta ação não pode ser desfeita. A conversa permanecerá na lista.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearMessages}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Limpar Mensagens
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-abba-black">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Carregando mensagens...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Nenhuma mensagem ainda</div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.numero}-${index}`}
              className={`flex ${message.direcao === 'sent' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                ${message.direcao === 'sent' 
                  ? 'bg-abba-green text-abba-black' 
                  : 'bg-abba-gray text-abba-text'
                }
              `}>
                <p className="text-sm">{message.mensagem}</p>
                <div className={`
                  text-xs mt-1 
                  ${message.direcao === 'sent' ? 'text-abba-black/70' : 'text-gray-400'}
                `}>
                  {formatMessageTime(message.data_hora || message.created_at)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input de mensagem */}
      <div className="p-4 border-t border-abba-gray bg-abba-black">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-abba-green">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder="Mensagem..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-abba-green">
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-abba-green">
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button 
            size="sm" 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending}
            className="bg-abba-green text-abba-black hover:bg-abba-green/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
