import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, User, MessageSquare } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePagination } from "@/hooks/usePagination"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ConversationDetailsModal } from './ConversationDetailsModal'

interface Conversation {
  id: string
  contact_name: string
  contact_avatar?: string
  last_message?: string
  last_message_at?: string
  status: string
  channel?: string
  assigned_to?: string
  unread_count: number
  profiles?: {
    full_name: string
    avatar_url?: string
  }
}

interface ConversationsTableProps {
  conversations: Conversation[]
  isLoading: boolean
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'aberta':
      return 'bg-green-500/20 text-green-700 border-green-500/30'
    case 'fechada':
      return 'bg-gray-500/20 text-gray-700 border-gray-500/30'
    case 'pendente':
      return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
    default:
      return 'bg-blue-500/20 text-blue-700 border-blue-500/30'
  }
}

const getChannelColor = (channel?: string) => {
  switch (channel) {
    case 'whatsapp':
      return 'bg-green-500/20 text-green-700 border-green-500/30'
    case 'telegram':
      return 'bg-blue-500/20 text-blue-700 border-blue-500/30'
    case 'instagram':
      return 'bg-pink-500/20 text-pink-700 border-pink-500/30'
    default:
      return 'bg-gray-500/20 text-gray-700 border-gray-500/30'
  }
}

export function ConversationsTable({ conversations, isLoading }: ConversationsTableProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedData,
    handlePageChange,
    handleItemsPerPageChange,
    startItem,
    endItem,
    itemsPerPageOptions
  } = usePagination({
    data: conversations,
    defaultItemsPerPage: 10
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contato</TableHead>
              <TableHead>Última Mensagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Agente</TableHead>
              <TableHead>Não Lidas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((conversation) => (
              <TableRow key={conversation.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={conversation.contact_avatar} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{conversation.contact_name}</div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="max-w-xs">
                    <div className="text-sm text-muted-foreground truncate">
                      {conversation.last_message || 'Nenhuma mensagem'}
                    </div>
                    {conversation.last_message_at && (
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(conversation.last_message_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(conversation.status)}>
                    {conversation.status}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  {conversation.channel && (
                    <Badge variant="outline" className={getChannelColor(conversation.channel)}>
                      {conversation.channel}
                    </Badge>
                  )}
                </TableCell>
                
                <TableCell>
                  {conversation.profiles?.full_name ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={conversation.profiles.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {conversation.profiles.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{conversation.profiles.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Não atribuído</span>
                  )}
                </TableCell>
                
                <TableCell>
                  {conversation.unread_count > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {conversation.unread_count}
                    </Badge>
                  )}
                </TableCell>
                
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Mostrando {startItem} a {endItem} de {conversations.length} conversas</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="ml-2 px-2 py-1 border border-border rounded bg-background"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>{option} por página</option>
              ))}
            </select>
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2)
                if (page > totalPages) return null
                
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {selectedConversation && (
        <ConversationDetailsModal
          conversation={selectedConversation}
          isOpen={!!selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  )
}