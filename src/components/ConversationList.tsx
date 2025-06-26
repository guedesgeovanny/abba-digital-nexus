
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

interface Conversation {
  id: number
  name: string
  username: string
  lastMessage: string
  time: string
  avatar: string
  status: string
  unread: boolean
  isOnline: boolean
  isActive: boolean
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: Conversation
  onSelectConversation: (conversation: Conversation) => void
}

export const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation 
}: ConversationListProps) => {
  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`
            flex items-center p-3 cursor-pointer hover:bg-abba-gray transition-colors
            ${selectedConversation.id === conversation.id ? 'bg-abba-gray border-r-2 border-abba-green' : ''}
          `}
        >
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={conversation.avatar} alt={conversation.name} />
              <AvatarFallback className="bg-abba-gray">
                <User className="h-6 w-6 text-abba-green" />
              </AvatarFallback>
            </Avatar>
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-abba-black"></div>
            )}
          </div>

          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-abba-text truncate">
                {conversation.name}
              </h3>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                {conversation.time}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-400 truncate">
                {conversation.lastMessage}
              </p>
              {conversation.unread && (
                <Badge className="bg-abba-green text-abba-black ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                  •
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
