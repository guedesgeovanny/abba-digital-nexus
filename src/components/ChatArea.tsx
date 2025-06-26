
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Smile, Mic, User, Bot, Trash2 } from "lucide-react"
import { useState } from "react"

interface Conversation {
  id: number
  name: string
  username: string
  lastMessage: string
  time: string
  avatar: string
  status: string
  unread: boolean
  isActive: boolean
}

interface ChatAreaProps {
  conversation: Conversation
  onDeleteConversation?: (conversationId: number) => void
}

// Mensagens mockadas para demonstração
const mockMessages = [
  {
    id: 1,
    sender: "other",
    content: "Se você trabalhana frente de uma tela...",
    time: "23:55",
    type: "text"
  },
  {
    id: 2,
    sender: "other",
    content: "Não descanse na frente de outra tela.",
    time: "23:55",
    type: "text"
  },
  {
    id: 3,
    sender: "other",
    content: "Qual tipo de descanso funciona pra você? Diga 👇...",
    time: "23:55",
    type: "text"
  },
  {
    id: 4,
    sender: "other",
    content: "👇",
    time: "23:55",
    type: "text"
  },
  {
    id: 5,
    sender: "other",
    content: "/lovable-uploads/570c9d08-209d-4434-84a8-b9937859bc5e.png",
    time: "23:55",
    type: "image"
  }
]

export const ChatArea = ({ conversation, onDeleteConversation }: ChatAreaProps) => {
  const [isAiAgentActive, setIsAiAgentActive] = useState(false)

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

  return (
    <div className="flex flex-col h-full">
      {/* Header do chat */}
      <div className="flex items-center justify-between p-4 border-b border-abba-gray bg-abba-black">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback className="bg-abba-gray">
              <User className="h-5 w-5 text-abba-green" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium text-abba-text">
              {conversation.name}
            </h3>
            <p className="text-xs text-gray-400">
              {conversation.username}
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
        {mockMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-xs lg:max-w-md px-4 py-2 rounded-lg
              ${message.sender === 'user' 
                ? 'bg-abba-green text-abba-black' 
                : 'bg-abba-gray text-abba-text'
              }
            `}>
              {message.type === 'image' ? (
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
                ${message.sender === 'user' ? 'text-abba-black/70' : 'text-gray-400'}
              `}>
                {message.time}
              </div>
            </div>
          </div>
        ))}
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
          
          <Button size="sm" className="bg-abba-green text-abba-black hover:bg-abba-green/90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
