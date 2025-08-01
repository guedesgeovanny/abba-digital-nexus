
import { Card, CardContent } from "@/components/ui/card"
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CRMConversation } from '@/hooks/useCRMConversations'
import { Phone, Mail, Building, DollarSign, MessageCircle, Instagram, Calendar, Paperclip } from 'lucide-react'
import { useConversationAttachments } from '@/hooks/useConversationAttachments'

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

  const getOwnershipBadge = () => {
    if (!isAdmin) return null
    
    if (conversation.user_id === currentUserId) {
      return (
        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
          Minha
        </span>
      )
    } else if (conversation.assigned_to === currentUserId) {
      return (
        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
          Atribuída
        </span>
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
        bg-abba-gray border-abba-gray transition-all duration-200 cursor-pointer
        hover:border-abba-green hover:shadow-lg hover:shadow-abba-green/20 hover:scale-[1.02]
        ${isDragging && !isDragOverlay ? 'opacity-50' : ''}
        ${isDragOverlay ? 'shadow-2xl shadow-abba-green/40 border-abba-green' : ''}
      `}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h4 className="font-medium text-abba-text truncate">{conversation.contact_name}</h4>
            {attachments.length > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Paperclip className="w-3 h-3" />
                <span className="text-xs">{attachments.length}</span>
              </div>
            )}
          </div>
          {getOwnershipBadge()}
        </div>
        
        {/* Channel and Value */}
        {(conversation.channel || conversation.value) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {conversation.channel && (
              <div className="flex items-center gap-1">
                {getChannelIcon(conversation.channel)}
                <span className="capitalize">{conversation.channel}</span>
              </div>
            )}
            {conversation.value && (
              <div className="flex items-center gap-1 text-green-600">
                <DollarSign className="w-3 h-3" />
                <span className="font-medium">{formatValue(conversation.value)}</span>
              </div>
            )}
          </div>
        )}

        {/* Phone or Email */}
        {(conversation.phone || conversation.email) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {conversation.phone ? (
              <>
                <Phone className="w-3 h-3" />
                <span className="truncate">{formatPhone(conversation.phone)}</span>
              </>
            ) : conversation.email ? (
              <>
                <Mail className="w-3 h-3" />
                <span className="truncate">{conversation.email}</span>
              </>
            ) : null}
          </div>
        )}

        {/* Company */}
        {conversation.company && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building className="w-3 h-3" />
            <span className="truncate">{conversation.company}</span>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>Criado em {formatDate(conversation.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
