
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CRMConversation } from '@/hooks/useCRMConversations'
import { Phone, Mail, Building, DollarSign, MessageCircle, Instagram, Calendar, Paperclip } from 'lucide-react'
import { useConversationAttachments } from '@/hooks/useConversationAttachments'
import { useAuth } from '@/contexts/AuthContext'
import { useUserById } from '@/hooks/useUserById'

interface LeadCardProps {
  conversation: CRMConversation
  onCardClick?: (conversation: CRMConversation) => void
  isDragOverlay?: boolean
  isAdmin?: boolean
  currentUserId?: string
}

export const LeadCard = ({ 
  conversation, 
  onCardClick, 
  isDragOverlay = false,
  isAdmin = false,
  currentUserId
}: LeadCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: conversation.id,
    disabled: isDragOverlay
  })

  const { attachments } = useConversationAttachments(conversation.id)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDragging) return
    
    onCardClick?.(conversation)
  }

  const formatValue = (value?: number) => {
    if (!value) return null
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPhone = (phone?: string) => {
    if (!phone) return null
    // Simple phone formatting for Brazilian numbers
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  const getChannelIcon = (channel?: string) => {
    switch (channel?.toLowerCase()) {
      case 'whatsapp':
        return <MessageCircle className="w-3 h-3" />
      case 'instagram':
        return <Instagram className="w-3 h-3" />
      default:
        return <MessageCircle className="w-3 h-3" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  const { user, userProfile } = useAuth()
  
  // Buscar dados do usuário atribuído se não for a conversa do próprio usuário
  const isOwnConversation = conversation.user_id === currentUserId
  const assignedUserId = conversation.assigned_to || conversation.user_id
  const { userProfile: assignedUser } = useUserById(!isOwnConversation ? assignedUserId : null)

  const getOwnershipAvatar = () => {
    if (!isAdmin) return null

    if (isOwnConversation) {
      return (
        <Avatar className="h-6 w-6" title="Sua conversa">
          <AvatarImage src={userProfile?.avatar_url || undefined} alt={userProfile?.full_name || 'Usuário'} />
          <AvatarFallback className="bg-green-100 text-green-800 text-xs">
            {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )
    } else if (assignedUser) {
      return (
        <Avatar className="h-6 w-6" title={`Atribuída a ${assignedUser.full_name || 'Usuário'}`}>
          <AvatarImage src={assignedUser.avatar_url || undefined} alt={assignedUser.full_name || 'Usuário'} />
          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
            {assignedUser.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )
    }
    return null
  }

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...(!isDragOverlay ? attributes : {})} 
      {...(!isDragOverlay ? listeners : {})}
      onClick={handleCardClick}
      className={`
        bg-card border-border transition-all duration-200 cursor-pointer
        hover:border-abba-green hover:shadow-lg hover:shadow-abba-green/20 hover:scale-[1.02]
        ${isDragging && !isDragOverlay ? 'opacity-50' : ''}
        ${isDragOverlay ? 'shadow-2xl shadow-abba-green/40 border-abba-green' : ''}
      `}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h4 className="font-medium text-card-foreground truncate">{conversation.contact_name}</h4>
          </div>
          {getOwnershipAvatar()}
        </div>
        
        {/* Channel - Always display */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {getChannelIcon(conversation.channel || 'whatsapp')}
          <span className="capitalize">{conversation.channel || 'WhatsApp'}</span>
        </div>

        {/* Phone - Only when available */}
        {conversation.phone && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span className="truncate">{formatPhone(conversation.phone)}</span>
          </div>
        )}

        {/* Created Date - Always display */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>Criado em {formatDate(conversation.created_at)}</span>
        </div>

        {/* Value - Always display */}
        <div className="flex items-center gap-1 text-xs">
          <DollarSign className="w-3 h-3 text-muted-foreground" />
          {conversation.value && conversation.value > 0 ? (
            <span className="font-medium text-green-600">{formatValue(conversation.value)}</span>
          ) : (
            <span className="text-muted-foreground">Não Informado</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
