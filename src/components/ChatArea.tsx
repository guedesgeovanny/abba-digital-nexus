
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Smile, Mic, User, Bot, Trash2 } from "lucide-react"
import { useState } from "react"
import { Conversation } from "@/hooks/useConversations"
import { useMessages } from "@/hooks/useMessages"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ChatAreaProps {
  conversation: Conversation
  onDeleteConversation?: (conversationId: string) => void
}

export const ChatArea = ({ conversation, onDeleteConversation }: ChatAreaProps) => {
  const [isAiAgentActive, setIsAiAgentActive] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const { messages, isLoading, sendMessage, isSending } = useMessages(conversation.id)

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
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDeleteConversation}
            className="text-gray-400 hover:text-red-500"
            title="Excluir Conversa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
              key={`${message.id}-${index}`}
              className={`flex ${message.direction === 'sent' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                ${message.direction === 'sent' 
                  ? 'bg-abba-green text-abba-black' 
                  : 'bg-abba-gray text-abba-text'
                }
              `}>
                {message.message_type === 'image' ? (
                  <img 
                    src={message.content} 
                    alt="Shared image" 
                    className="rounded-lg max-w-full h-auto"
                  />
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <div className={`
                  text-xs mt-1 
                  ${message.direction === 'sent' ? 'text-abba-black/70' : 'text-gray-400'}
                `}>
                  {formatMessageTime(message.created_at)}
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
