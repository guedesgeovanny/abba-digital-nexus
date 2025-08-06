import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { X, User, Send, CheckCircle, Clock, Bot } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useMessages } from "@/hooks/useMessages"

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

interface ConversationDetailsModalProps {
  conversation: Conversation
  isOpen: boolean
  onClose: () => void
}

export function ConversationDetailsModal({ 
  conversation, 
  isOpen, 
  onClose 
}: ConversationDetailsModalProps) {
  const { messages, isLoading } = useMessages(conversation.id)

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.contact_avatar} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle>{conversation.contact_name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getStatusColor(conversation.status)}>
                    {conversation.status}
                  </Badge>
                  {conversation.channel && (
                    <Badge variant="outline" className={getChannelColor(conversation.channel)}>
                      {conversation.channel}
                    </Badge>
                  )}
                  {conversation.unread_count > 0 && (
                    <Badge variant="destructive">
                      {conversation.unread_count} não lidas
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Conversation Info */}
        <div className="flex-shrink-0 grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Agente Responsável</label>
            <div className="mt-1">
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
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Última Atividade</label>
            <div className="mt-1">
              {conversation.last_message_at ? (
                <span className="text-sm">
                  {format(new Date(conversation.last_message_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">-</span>
              )}
            </div>
          </div>
        </div>

        {/* Messages Timeline */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                ))
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma mensagem encontrada
                </div>
              ) : (
                messages.map((message) => {
                  const isOutgoing = message.direcao === 'sent'
                  const isAgent = message.mensagem_is_agent

                  return (
                    <div key={message.numero} className={`flex gap-3 ${isOutgoing ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {isOutgoing ? (
                          isAgent ? (
                            <div className="w-full h-full bg-primary rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary-foreground" />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-secondary-foreground" />
                            </div>
                          )
                        ) : (
                          <AvatarImage src={conversation.contact_avatar} />
                        )}
                        <AvatarFallback>
                          {isOutgoing ? (
                            isAgent ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />
                          ) : (
                            conversation.contact_name.charAt(0)
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <div className={`flex-1 ${isOutgoing ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {isOutgoing ? (isAgent ? 'Agente' : 'Você') : message.nome_contato}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.data_hora), 'dd/MM HH:mm', { locale: ptBR })}
                          </span>
                          {isOutgoing && (
                            <div className="flex items-center gap-1">
                              {isAgent && (
                                <Bot className="h-3 w-3 text-primary" />
                              )}
                              <Send className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className={`
                          inline-block max-w-[80%] p-3 rounded-lg text-sm
                          ${isOutgoing 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted'
                          }
                        `}>
                          {message.mensagem}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Quick Actions */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-t border-border">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Marcar como Resolvida
            </Button>
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-1" />
              Marcar como Pendente
            </Button>
          </div>
          <Button size="sm">
            <Send className="h-4 w-4 mr-1" />
            Responder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}