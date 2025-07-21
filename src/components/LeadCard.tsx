
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Calendar, Phone, Mail, Instagram } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface LeadCardProps {
  deal: any
  stageColor: string
  onCardClick?: (deal: any) => void
}

export const LeadCard = ({ deal, stageColor, onCardClick }: LeadCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getSourceIcon = (source: string) => {
    const lowerSource = source.toLowerCase()
    if (lowerSource.includes('instagram')) {
      return <Instagram className="w-3 h-3" />
    } else if (lowerSource.includes('whatsapp')) {
      return <Phone className="w-3 h-3" />
    } else if (lowerSource.includes('telefone')) {
      return <Phone className="w-3 h-3" />
    } else {
      return <Mail className="w-3 h-3" />
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevenir clique se estiver arrastando ou clicando no dropdown
    if (isDragging || (e.target as HTMLElement).closest('[role="button"]')) {
      return
    }
    
    onCardClick?.(deal)
  }

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={handleCardClick}
      className={`
        bg-abba-gray border-abba-gray transition-all duration-200 cursor-pointer
        hover:border-abba-green hover:shadow-lg hover:shadow-abba-green/20 hover:scale-[1.02]
        ${isDragging ? 'shadow-2xl shadow-abba-green/40 scale-105 rotate-2 border-abba-green' : ''}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-abba-text">{deal.name}</h4>
            <p className="text-sm text-gray-400">{deal.company}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem>Mover</DropdownMenuItem>
              <DropdownMenuItem className="text-red-400">Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-abba-green">{deal.value}</span>
            <div className="flex items-center gap-1">
              {getSourceIcon(deal.source)}
              <span className="text-xs text-gray-400">{deal.source}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            Agente: {deal.agent}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {deal.daysInStage} dias neste estágio
          </div>
        </div>
        
        <div className="space-y-1 mb-3 text-xs">
          {deal.contact && (
            <div className="flex items-center gap-2 text-gray-400">
              <Phone className="w-3 h-3" />
              {deal.contact}
            </div>
          )}
          {deal.email && (
            <div className="flex items-center gap-2 text-gray-400">
              <Mail className="w-3 h-3" />
              {deal.email}
            </div>
          )}
          {deal.instagram && (
            <div className="flex items-center gap-2 text-gray-400">
              <Instagram className="w-3 h-3" />
              {deal.instagram}
            </div>
          )}
        </div>
        
        <div className="flex gap-1 flex-wrap">
          {deal.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
